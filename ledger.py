import random
from decimal import Decimal, ROUND_DOWN

PAISA = Decimal("0.01")


def split_with_random_remainder(total: Decimal, party_ids: list) -> dict[int, Decimal]:
    """Split *total* equally across *party_ids*; assign leftover paise at random."""
    if not party_ids:
        raise ValueError("At least one party is required")
    if total <= 0:
        raise ValueError("Total must be positive")

    n = len(party_ids)
    base = (total / n).quantize(PAISA, rounding=ROUND_DOWN)
    shares = {pid: base for pid in party_ids}

    remainder_paise = int((total - base * n) / PAISA)
    if remainder_paise > 0:
        for pid in random.sample(party_ids, remainder_paise):
            shares[pid] += PAISA

    return shares
