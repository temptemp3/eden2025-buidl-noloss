from algopy import (
    Global,
    arc4,
    UInt64,
    BoxMap,
    Account,
    BigUInt,
    Txn,
    subroutine,
    urange,
)
from opensubmarine import Ownable
from opensubmarine.utils.types import Bytes32
from ARC200TokenInterface import ARC200TokenInterface


class Randomness(arc4.Struct):
    round: arc4.UInt64
    seed: Bytes32


class RandomnessBeacon(Ownable):
    def __init__(self) -> None:
        self.owner = Global.creator_address
        self.seeds = arc4.DynamicArray[Randomness]()
        self.max_seeds = UInt64(10)

    @arc4.abimethod
    def add_seed(self, round: arc4.UInt64, seed: Bytes32) -> None:
        if self.seeds.length == self.max_seeds:
            self.seeds.pop()
            self.seeds = (
                arc4.DynamicArray[Randomness](
                    Randomness(
                        round=round,
                        seed=seed.copy(),
                    ),
                )
                + self.seeds
            )
        else:
            self.seeds.append(
                Randomness(
                    round=round,
                    seed=seed.copy(),
                )
            )

    @arc4.abimethod
    def get(self) -> Bytes32:
        if self.seeds.length == 0:
            return Bytes32.from_bytes(b"\x00" * 32)
        else:
            return self.seeds[0].seed

    @arc4.abimethod
    def get_first_seed(self) -> Bytes32:
        return self.get()

    @arc4.abimethod
    def get_last_seed(self) -> Bytes32:
        if self.seeds.length == 0:
            return Bytes32.from_bytes(b"\x00" * 32)
        else:
            return self.seeds[-1].seed

    @arc4.abimethod
    def get_exact_seed(self, round: arc4.UInt64) -> Bytes32:
        for index in urange(self.max_seeds):
            if self.seeds[index].round == round:
                return self.seeds[index].seed
        assert False, "Seed not found"


class TicketRange(arc4.Struct):
    end: arc4.UInt256
    holder: arc4.Address


class TicketPurchased(arc4.Struct):
    ticket_range: TicketRange


class NoLoss(Ownable):
    """
    No Loss Lottery
    """

    def __init__(self) -> None:
        # ownable state
        # Ownable has owner state which we must initialize
        self.staked_token = UInt64()
        self.reward_token = UInt64()
        self.randomness_beacon = UInt64()
        self.reward_amount = BigUInt()
        self.owner = Global.creator_address  # set owner to creator
        self.deadline = UInt64()  # deadline of the contract
        self.balances = BoxMap(Account, BigUInt)  # balances of each account
        self.total_tickets = BigUInt()  # total number of tickets
        self.seed = Bytes32.from_bytes(b"\x00" * 32)  # block seed
        self.price = BigUInt()  # price of the ticket
        self.tickets = arc4.DynamicArray[TicketRange]()  # ranges of tickets
        self.ticket_index = UInt64()

    @arc4.abimethod
    def setup(
        self,
        deadline: arc4.UInt64,
        staked_token: arc4.UInt64,
        price: arc4.UInt256,
        reward_token: arc4.UInt64,
        reward_amount: arc4.UInt256,
    ) -> None:
        self.deadline = Global.latest_timestamp + deadline.native
        self.staked_token = staked_token.native
        self.total_tickets = BigUInt(0)
        self.price = price.native
        self.reward_token = reward_token.native
        self.reward_amount = reward_amount.native
        self.tickets.append(
            TicketRange(
                arc4.UInt256(0),
                arc4.Address(self.owner),
            )
        )

    @arc4.abimethod
    def buy_ticket(self, amount: arc4.UInt256) -> None:
        assert Global.latest_timestamp < self.deadline
        assert amount > 0
        assert amount.native % self.price == 0
        number_of_tickets = amount.native // self.price
        assert number_of_tickets > 0
        arc4.abi_call(
            ARC200TokenInterface.arc200_transferFrom,
            arc4.Address(Txn.sender),
            arc4.Address(Global.current_application_address),
            amount,
            app_id=self.staked_token,
        )
        self.tickets.append(
            TicketRange(
                arc4.UInt256(self.total_tickets + number_of_tickets),
                arc4.Address(Txn.sender),
            )
        )
        self.total_tickets += number_of_tickets
        ##self.seed = arc4.UInt64.from_bytes(op.Block.blk_seed(Global.round)).native
        if self.balances[Txn.sender] == 0:
            self.balances[Txn.sender] = number_of_tickets
        else:
            self.balances[Txn.sender] += number_of_tickets
        arc4.emit(
            TicketPurchased(
                TicketRange(
                    arc4.UInt256(self.total_tickets + number_of_tickets),
                    arc4.Address(Txn.sender),
                )
            )
        )

    @arc4.abimethod
    def withdraw(self) -> None:
        assert Global.latest_timestamp > self.deadline
        assert self.balances[Txn.sender] > 0
        arc4.abi_call(
            ARC200TokenInterface.arc200_transfer,
            arc4.Address(Txn.sender),
            arc4.UInt256(self.balances[Txn.sender] * self.price),
            app_id=self.staked_token,
        )
        self.balances[Txn.sender] = BigUInt(0)

    @arc4.abimethod
    def fetch_seed(self, seed: Bytes32) -> None:
        # TODO require once after deadlone and future block
        seed, _txn = arc4.abi_call(
            RandomnessBeacon.get,
            app_id=self.randomness_beacon,
        )
        self.seed = seed.copy()

    @arc4.abimethod
    def check_winner(self, address: arc4.Address) -> bool:
        """
        Claim prize at end of period
        """
        assert Global.latest_timestamp > self.deadline
        assert self.ticket_index < self.tickets.length
        m_winning_ticket_range = self.tickets[self.ticket_index].copy()
        m_winner = m_winning_ticket_range.holder
        m_winning_ticket_number = m_winning_ticket_range.end
        self.ticket_index += 1
        if (
            self._get_winning_ticket_number(
                arc4.UInt256.from_bytes(self.seed.bytes).native
            )
            <= m_winning_ticket_number
        ):
            self._send_prize(m_winner.native)
            return True
        return False

    @subroutine
    def _get_winning_ticket_number(self, random_number: BigUInt) -> BigUInt:
        return random_number % self.total_tickets

    @subroutine
    def _send_prize(self, winner: Account) -> None:
        arc4.abi_call(
            ARC200TokenInterface.arc200_transfer,
            winner,
            arc4.UInt256(self.reward_amount),
            app_id=self.reward_token,
        )
