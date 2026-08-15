// title: Bank account with transaction history
// level: intermediate
// about: Deposits, withdrawals, overdraft rules and a printed statement — inheritance and exceptions doing real work.
// tags: oop, inheritance, exceptions

import java.util.*;

public class Main {
    public static void main(String[] args) {
        Savings asha = new Savings("Asha", 5000, 0.04);
        Current shop = new Current("Corner Shop", 2000, 3000);

        asha.deposit(1500);
        asha.withdraw(2000);
        asha.addInterest();

        shop.withdraw(4000);          // allowed, dips into the overdraft
        try {
            shop.withdraw(2000);      // beyond the overdraft
        } catch (IllegalStateException e) {
            System.out.println("Refused: " + e.getMessage());
        }

        for (Account a : List.of(asha, shop)) a.statement();
    }
}

abstract class Account {
    protected final String owner;
    protected double balance;
    protected final List<String> history = new ArrayList<>();

    Account(String owner, double opening) {
        this.owner = owner;
        this.balance = opening;
        history.add(String.format("opened with %.2f", opening));
    }

    void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("deposit must be positive");
        balance += amount;
        history.add(String.format("deposit  %10.2f -> %.2f", amount, balance));
    }

    void withdraw(double amount) {
        if (amount > available())
            throw new IllegalStateException(String.format("%.2f exceeds the %.2f available", amount, available()));
        balance -= amount;
        history.add(String.format("withdraw %10.2f -> %.2f", amount, balance));
    }

    abstract double available();

    void statement() {
        System.out.printf("%n%s — %s%n", owner, getClass().getSimpleName());
        history.forEach(line -> System.out.println("   " + line));
        System.out.printf("   balance %.2f, available %.2f%n", balance, available());
    }
}

class Savings extends Account {
    private final double rate;
    Savings(String owner, double opening, double rate) { super(owner, opening); this.rate = rate; }
    double available() { return balance; }
    void addInterest() {
        double interest = balance * rate;
        balance += interest;
        history.add(String.format("interest %10.2f -> %.2f", interest, balance));
    }
}

class Current extends Account {
    private final double overdraft;
    Current(String owner, double opening, double overdraft) { super(owner, opening); this.overdraft = overdraft; }
    double available() { return balance + overdraft; }
}
