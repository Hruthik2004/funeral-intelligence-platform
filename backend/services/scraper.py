import re
import logging
from typing import Optional
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
}

PHONE_PATTERN = re.compile(
    r"(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})"
)
EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
ZIP_PATTERN = re.compile(r"\b\d{5}(?:-\d{4})?\b")

FUNERAL_SERVICES = [
    "burial", "cremation", "embalming", "viewing", "visitation",
    "funeral service", "memorial service", "graveside service",
    "transportation", "death certificate", "obituary", "urn",
    "casket", "vault", "pre-planning", "pre-arrangement",
    "grief counseling", "flowers", "monument", "reception",
    "direct cremation", "direct burial", "green burial",
    "military honors", "veterans", "repatriation",
]

PRICING_KEYWORDS = [
    "price", "cost", "fee", "package", "$", "rate", "charge",
    "starting at", "from", "per", "total",
]


def fetch_page(url: str) -> Optional[BeautifulSoup]:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15, allow_redirects=True)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.content, "lxml")
        for tag in soup(["script", "style", "noscript", "iframe"]):
            tag.decompose()
        return soup
    except requests.RequestException as e:
        logger.error(f"Failed to fetch {url}: {e}")
        return None


def extract_name(soup: BeautifulSoup, url: str) -> str:
    candidates = []

    og_site = soup.find("meta", property="og:site_name")
    if og_site and og_site.get("content"):
        candidates.append(og_site["content"].strip())

    h1 = soup.find("h1")
    if h1:
        text = h1.get_text(strip=True)
        if text and len(text) < 100:
            candidates.append(text)

    title = soup.find("title")
    if title:
        text = title.get_text(strip=True)
        text = re.split(r"[|\-–—]", text)[0].strip()
        if text and len(text) < 80:
            candidates.append(text)

    logo = soup.find(class_=re.compile(r"logo", re.I))
    if logo:
        alt = logo.get("alt") or logo.get_text(strip=True)
        if alt and len(alt) < 80:
            candidates.append(alt)

    for c in candidates:
        if any(kw in c.lower() for kw in ["funeral", "mortuary", "cremation", "memorial"]):
            return c

    from urllib.parse import urlparse
    domain = urlparse(url).netloc.replace("www.", "").split(".")[0]
    domain_name = domain.replace("-", " ").replace("_", " ").title()

    return candidates[0] if candidates else domain_name


def extract_phone(soup: BeautifulSoup) -> Optional[str]:
    tel_links = soup.find_all("a", href=re.compile(r"^tel:"))
    for link in tel_links:
        href = link.get("href", "").replace("tel:", "").strip()
        if href:
            return href

    text = soup.get_text(" ")
    matches = PHONE_PATTERN.findall(text)
    if matches:
        full = "".join(matches[0]).strip()
        return full if full else None
    return None


def extract_email(soup: BeautifulSoup) -> Optional[str]:
    mailto = soup.find("a", href=re.compile(r"^mailto:"))
    if mailto:
        return mailto.get("href", "").replace("mailto:", "").split("?")[0].strip()

    text = soup.get_text(" ")
    matches = EMAIL_PATTERN.findall(text)
    if matches:
        filtered = [m for m in matches if not m.endswith((".png", ".jpg", ".gif"))]
        return filtered[0] if filtered else None
    return None


def extract_address(soup: BeautifulSoup) -> dict:
    address_tag = soup.find("address")
    if address_tag:
        text = address_tag.get_text(separator=", ", strip=True)
        return _parse_address_text(text)

    for selector in [
        "[class*='address']", "[class*='location']", "[id*='address']",
        "[itemprop='streetAddress']", "[itemtype*='PostalAddress']",
    ]:
        el = soup.select_one(selector)
        if el:
            text = el.get_text(separator=", ", strip=True)
            if ZIP_PATTERN.search(text):
                return _parse_address_text(text)

    text = soup.get_text(" ")
    zip_match = ZIP_PATTERN.search(text)
    if zip_match:
        start = max(0, zip_match.start() - 100)
        snippet = text[start : zip_match.end() + 10].strip()
        return _parse_address_text(snippet)

    return {}


def _parse_address_text(text: str) -> dict:
    text = " ".join(text.split())
    result: dict = {"full": text}

    zip_match = ZIP_PATTERN.search(text)
    if zip_match:
        result["zip_code"] = zip_match.group()

    state_pattern = re.compile(
        r"\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|"
        r"MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|"
        r"TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b"
    )
    state_match = state_pattern.search(text)
    if state_match:
        result["state"] = state_match.group()

    city_pattern = re.compile(r"([A-Z][a-zA-Z\s]+),?\s+" + state_pattern.pattern)
    city_match = city_pattern.search(text)
    if city_match:
        result["city"] = city_match.group(1).strip()

    return result


def extract_services(soup: BeautifulSoup) -> list:
    found = set()
    text_lower = soup.get_text(" ").lower()

    for service in FUNERAL_SERVICES:
        if service in text_lower:
            found.add(service.title())

    for el in soup.find_all(["li", "h3", "h4", "p"]):
        text = el.get_text(strip=True)
        if 5 < len(text) < 80:
            for kw in ["service", "funeral", "cremation", "burial", "memorial", "viewing"]:
                if kw in text.lower():
                    cleaned = re.sub(r"\s+", " ", text).strip()
                    if cleaned not in found and len(cleaned) < 70:
                        found.add(cleaned)
                    break

    return sorted(list(found))[:20]


def extract_pricing(soup: BeautifulSoup) -> dict:
    pricing: dict = {}
    price_pattern = re.compile(r"\$[\d,]+(?:\.\d{2})?")

    for el in soup.find_all(["tr", "li", "div", "p"]):
        text = el.get_text(separator=" ", strip=True)
        prices = price_pattern.findall(text)
        if prices and any(kw in text.lower() for kw in PRICING_KEYWORDS):
            cleaned_text = re.sub(r"\s+", " ", text).strip()
            if len(cleaned_text) < 200:
                for service_kw in ["cremation", "burial", "basic", "direct", "viewing", "package"]:
                    if service_kw in text.lower():
                        key = service_kw.replace(" ", "_")
                        if key not in pricing:
                            pricing[key] = f"{cleaned_text[:100]}: {prices[0]}"
                        break

    return pricing


def extract_description(soup: BeautifulSoup) -> Optional[str]:
    og_desc = soup.find("meta", property="og:description")
    if og_desc and og_desc.get("content"):
        return og_desc["content"].strip()[:500]

    meta_desc = soup.find("meta", attrs={"name": "description"})
    if meta_desc and meta_desc.get("content"):
        return meta_desc["content"].strip()[:500]

    for selector in ["[class*='about']", "[class*='intro']", "[class*='hero'] p", "main p"]:
        el = soup.select_one(selector)
        if el:
            text = el.get_text(strip=True)
            if 50 < len(text) < 600:
                return text

    return None


def scrape_provider(url: str) -> dict:
    errors = []
    result = {
        "name": None,
        "phone": None,
        "email": None,
        "address": {},
        "services": [],
        "pricing": {},
        "description": None,
        "website": url,
        "source_url": url,
        "errors": [],
    }

    soup = fetch_page(url)
    if soup is None:
        result["errors"].append(f"Could not fetch page: {url}")
        result["name"] = "Unknown Provider"
        return result

    try:
        result["name"] = extract_name(soup, url)
    except Exception as e:
        result["name"] = "Unknown Provider"
        errors.append(f"Name extraction failed: {e}")

    try:
        result["phone"] = extract_phone(soup)
    except Exception as e:
        errors.append(f"Phone extraction failed: {e}")

    try:
        result["email"] = extract_email(soup)
    except Exception as e:
        errors.append(f"Email extraction failed: {e}")

    try:
        result["address"] = extract_address(soup)
    except Exception as e:
        errors.append(f"Address extraction failed: {e}")

    try:
        result["services"] = extract_services(soup)
    except Exception as e:
        errors.append(f"Services extraction failed: {e}")

    try:
        result["pricing"] = extract_pricing(soup)
    except Exception as e:
        errors.append(f"Pricing extraction failed: {e}")

    try:
        result["description"] = extract_description(soup)
    except Exception as e:
        errors.append(f"Description extraction failed: {e}")

    result["errors"] = errors
    logger.info(f"Scraped '{result['name']}' from {url} with {len(errors)} errors")
    return result
