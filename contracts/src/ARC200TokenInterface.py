from algopy import (
    arc4,
    ARC4Contract,
    String,
    UInt64,
    BigUInt,
    BoxMap,
    Account,
    Bytes,
)

from opensubmarine.utils.types import Bytes8, Bytes32


class ARC200TokenInterface(ARC4Contract):
    def __init__(self) -> None:
        # arc200 state
        self.name = String()
        self.symbol = String()
        self.decimals = UInt64()
        self.totalSupply = BigUInt()
        self.balances = BoxMap(Account, BigUInt)
        self.approvals = BoxMap(Bytes, BigUInt)

    @arc4.abimethod(readonly=True)
    def arc200_name(self) -> Bytes32:
        """
        Get name of token.
        """
        return Bytes32.from_bytes(Bytes())

    @arc4.abimethod(readonly=True)
    def arc200_symbol(self) -> Bytes8:
        """
        Get symbol of token.
        """
        return Bytes8.from_bytes(Bytes())

    @arc4.abimethod(readonly=True)
    def arc200_decimals(self) -> arc4.UInt8:
        """
        Get decimals of token.
        """
        return arc4.UInt8(UInt64())

    @arc4.abimethod(readonly=True)
    def arc200_totalSupply(self) -> arc4.UInt256:
        """
        Get total supply of token.
        """
        return arc4.UInt256(self.totalSupply)

    @arc4.abimethod(readonly=True)
    def arc200_balanceOf(self, account: arc4.Address) -> arc4.UInt256:
        """
        Get balance of account.
        """
        return arc4.UInt256(0)

    @arc4.abimethod
    def arc200_transferFrom(
        self, sender: arc4.Address, recipient: arc4.Address, amount: arc4.UInt256
    ) -> arc4.Bool:
        """
        Transfer tokens from sender to recipient.
        """
        return arc4.Bool(True)

    @arc4.abimethod
    def arc200_transfer(
        self, recipient: arc4.Address, amount: arc4.UInt256
    ) -> arc4.Bool:
        """
        Transfer tokens from sender to recipient.
        """
        return arc4.Bool(True)

    @arc4.abimethod
    def arc200_approve(self, spender: arc4.Address, amount: arc4.UInt256) -> arc4.Bool:
        """
        Approve spender to spend amount.
        """
        return arc4.Bool(True)

    @arc4.abimethod(readonly=True)
    def arc200_allowance(
        self, owner: arc4.Address, spender: arc4.Address
    ) -> arc4.UInt256:
        """
        Get allowance of spender.
        """
        return arc4.UInt256(0)
