def normalize_tags(tags):
    """
    Normalize tags into clean list.

    Accepts:
    - ["networking dns linux"]
    - ["networking", "dns", "linux"]
    - ["#networking", "#dns", "#linux"]
    - ["networking, dns, linux"]

    Returns:
    ["networking", "dns", "linux"]
    """

    if not tags:
        return []

    normalized = []

    for tag in tags:
        # Replace commas with space, then split
        parts = tag.replace(",", " ").split()

        for part in parts:
            clean = part.strip().lstrip("#").lower()

            if clean:
                normalized.append(clean)

    # Remove duplicates while preserving order
    seen = set()
    result = []

    for tag in normalized:
        if tag not in seen:
            seen.add(tag)
            result.append(tag)

    return result