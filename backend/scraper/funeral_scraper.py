import requests
from bs4 import BeautifulSoup
import re
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

FUNERAL_SERVICES = [
    "burial", "cremation", "embalming", "viewing", "visitation",
    "funeral service", "graveside service", "memorial service",
    "pre-planning", "pre-need", "grief support", "obituary",
    "casket", "urn", "transportation", "death certificate",
    "flowers", "reception", "direct burial", "direct cremation",
    "celebration of life", "veteran services", "green burial",
]

def extract_phone(text: str) -> Optional[str]:
    patterns = [
        r'\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}',
        r'\+1[\s.\-]\d{3}[\s.\-]\d{3}[\s.\-]\d{4}',
        r'\d{10}',
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0).strip()
    return None

def extract_email(text: str) -> Optional[str]:
    match = re.search(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', text)
    return match.group(0) if match else None

def extract_services(soup: BeautifulSoup, text: str) -> list:
    found = []
    text_lower = text.lower()
    for service in FUNERAL_SERVICES:
        if service in text_lower:
            found.append(service.title())
    service_sections = soup.find_all(
        ['ul', 'ol'],
        class_=re.compile(r'service|offering|package', re.I)
    )
    for section in service_sections:
        for li in section.find_all('li'):
            item = li.get_text(strip=True)
            if item and len(item) < 80 and item not in found:
                found.append(item)
    return list(dict.fromkeys(found))[:20]

def extract_pricing(soup: BeautifulSoup, text: str) -> dict:
    pricing = {}
    price_pattern = re.compile(r'\$[\d,]+(?:\.\d{2})?')
    price_matches = price_pattern.findall(text)
    if price_matches:
        prices = [p.replace(',', '') for p in price_matches[:5]]
        pricing["mentioned_prices"] = prices
    price_sections = soup.find_all(
        string=re.compile(r'\$[\d,]+', re.I)
    )
    for section in price_sections[:3]:
        parent = section.parent
        if parent:
            label = parent.get_text(strip=True)
            if len(label) < 100:
                pricing[f"price_note_{len(pricing)+1}"] = label
    return pricing

def extract_address(soup: BeautifulSoup, text: str) -> Dict[str, str]:
    result = {"full": None, "city": None, "state": None, "zip": None}
    address_el = soup.find(
        attrs={"itemtype": re.compile(r'PostalAddress', re.I)}
    )
    if address_el:
        city_el = address_el.find(attrs={"itemprop": "addressLocality"})
        state_el = address_el.find(attrs={"itemprop": "addressRegion"})
        zip_el = address_el.find(attrs={"itemprop": "postalCode"})
        street_el = address_el.find(attrs={"itemprop": "streetAddress"})
        if city_el:
            result["city"] = city_el.get_text(strip=True)
        if state_el:
            result["state"] = state_el.get_text(strip=True)
        if zip_el:
            result["zip"] = zip_el.get_text(strip=True)
        if street_el:
            result["full"] = street_el.get_text(strip=True)
        return result
    zip_match = re.search(r'\b(\d{5})(?:-\d{4})?\b', text)
    if zip_match:
        result["zip"] = zip_match.group(1)
    state_abbrevs = r'\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b'
    state_match = re.search(state_abbrevs, text)
    if state_match:
        result["state"] = state_match.group(1)
    addr_keywords = ['street', 'avenue', 'ave', 'road', 'rd', 'blvd', 'boulevard', 'drive', 'dr', 'lane', 'ln', 'way']
    for kw in addr_keywords:
        pattern = rf'\d+\s+[\w\s]+{kw}[\w\s,]*'
        match = re.search(pattern, text, re.I)
        if match:
            result["full"] = match.group(0).strip()[:200]
            break
    return result

def scrape_funeral_home(url: str) -> Dict[str, Any]:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except requests.RequestException as e:
        raise ValueError(f"Failed to fetch URL: {e}")

    soup = BeautifulSoup(resp.text, "lxml")
    for tag in soup(["script", "style", "noscript", "svg"]):
        tag.decompose()
    text = soup.get_text(separator=" ", strip=True)

    name = None
    for selector in ['h1', '[class*="funeral-home"], [class*="company-name"]', 'title']:
        el = soup.select_one(selector)
        if el:
            candidate = el.get_text(strip=True)
            if 3 < len(candidate) < 100:
                name = candidate
                break
    if not name:
        title_el = soup.find('title')
        name = title_el.get_text(strip=True)[:100] if title_el else "Unknown Provider"
    name = re.sub(r'\s*[-|–]\s*.+$', '', name).strip()

    phone_el = soup.find('a', href=re.compile(r'^tel:'))
    phone = phone_el['href'].replace('tel:', '').strip() if phone_el else extract_phone(text)

    email_el = soup.find('a', href=re.compile(r'^mailto:'))
    email = email_el['href'].replace('mailto:', '').split('?')[0] if email_el else extract_email(text)

    addr_data = extract_address(soup, text)
    services = extract_services(soup, text)
    pricing = extract_pricing(soup, text)

    meta_desc = soup.find('meta', attrs={'name': 'description'})
    description = meta_desc['content'].strip() if meta_desc and meta_desc.get('content') else None
    if not description:
        first_para = soup.find('p')
        description = first_para.get_text(strip=True)[:300] if first_para else None

    return {
        "name": name,
        "phone": phone,
        "email": email,
        "website": url,
        "address": addr_data.get("full"),
        "city": addr_data.get("city"),
        "state": addr_data.get("state"),
        "zip_code": addr_data.get("zip"),
        "services": services,
        "pricing": pricing if pricing else None,
        "description": description,
        "source_url": url,
    }
