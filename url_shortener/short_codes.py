"""Convert positive PostgreSQL row IDs to and from short base62 codes."""

ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
BASE = len(ALPHABET)
VALUES = {character: value for value, character in enumerate(ALPHABET)}


def encode_id(row_id: int) -> str:
    if isinstance(row_id, bool) or not isinstance(row_id, int) or row_id < 1:
        raise ValueError("row ID must be a positive integer")

    characters = []
    while row_id:
        row_id, remainder = divmod(row_id, BASE)
        characters.append(ALPHABET[remainder])
    return "".join(reversed(characters))


def decode_code(code: str) -> int:
    if not isinstance(code, str) or not code or code.startswith("0"):
        raise ValueError("invalid short code")

    row_id = 0
    for character in code:
        if character not in VALUES:
            raise ValueError("invalid short code")
        row_id = row_id * BASE + VALUES[character]
    return row_id
