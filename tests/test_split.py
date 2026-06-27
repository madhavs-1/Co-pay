import pytest
from decimal import Decimal
from unittest import mock

from ledger import split_with_random_remainder


def test_split_100_by_3_sums_to_total():
    shares = split_with_random_remainder(Decimal("100.00"), [1, 2, 3])
    assert sum(shares.values()) == Decimal("100.00")
    assert set(shares.keys()) == {1, 2, 3}


def test_split_100_by_3_with_fixed_random_recipient():
    with mock.patch("ledger.random.sample", return_value=[3]):
        shares = split_with_random_remainder(Decimal("100.00"), [1, 2, 3])
    assert shares[1] == Decimal("33.33")
    assert shares[2] == Decimal("33.33")
    assert shares[3] == Decimal("33.34")


def test_split_across_many_users():
    party_ids = list(range(1, 8))
    shares = split_with_random_remainder(Decimal("100.00"), party_ids)
    assert sum(shares.values()) == Decimal("100.00")
    assert len(shares) == 7


def test_split_single_user_gets_full_amount():
    shares = split_with_random_remainder(Decimal("100.00"), [42])
    assert shares == {42: Decimal("100.00")}


def test_split_even_division_has_no_remainder():
    shares = split_with_random_remainder(Decimal("99.99"), [1, 2, 3])
    assert shares[1] == Decimal("33.33")
    assert shares[2] == Decimal("33.33")
    assert shares[3] == Decimal("33.33")


def test_random_splits_always_reconcile():
    total = Decimal("100.00")
    party_ids = [1, 2, 3, 4, 5]
    for _ in range(100):
        shares = split_with_random_remainder(total, party_ids)
        assert sum(shares.values()) == total


def test_rejects_invalid_input():
    with pytest.raises(ValueError, match="At least one party"):
        split_with_random_remainder(Decimal("10.00"), [])
    with pytest.raises(ValueError, match="Total must be positive"):
        split_with_random_remainder(Decimal("0.00"), [1])
