import re

def extract_wiki_links(text: str):
    if not text:
        return []

    pattern = r"\[\[(.*?)\]\]"
    matches = re.findall(pattern, text)

    # clean whitespace
    return [m.strip() for m in matches if m.strip()]