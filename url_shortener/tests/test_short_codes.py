import pytest

from short_codes import decode_code, encode_id


@pytest.mark.parametrize("row_id", [1, 9, 10, 61, 62, 63, 3844, 2**63 - 1])
def test_codes_round_trip(row_id):
    assert decode_code(encode_id(row_id)) == row_id


@pytest.mark.parametrize("code", ["", "0", "01", "-1", "a!", "a/b"])
def test_invalid_codes(code):
    with pytest.raises(ValueError):
        decode_code(code)
