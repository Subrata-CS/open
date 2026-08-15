// title: ATM machine
// level: beginner
// about: A cash machine with a PIN, a balance and a withdrawal limit — the classic first "real program" in C.
// tags: menu, validation, state
// input: 1234
// input: 2
// input: 500
// input: 1
// input: 4

#include <stdio.h>

int main(void) {
    const int PIN = 1234;
    double balance = 2500.0;
    int entered, choice;
    double amount;

    printf("=== Open Bank ATM ===\n");
    printf("Enter your PIN: ");
    if (scanf("%d", &entered) != 1 || entered != PIN) {
        printf("Incorrect PIN. Card retained.\n");
        return 1;
    }

    while (1) {
        printf("\n1) Balance  2) Withdraw  3) Deposit  4) Exit\n> ");
        if (scanf("%d", &choice) != 1) break;

        if (choice == 1) {
            printf("Balance: %.2f\n", balance);
        } else if (choice == 2) {
            printf("Amount: ");
            scanf("%lf", &amount);
            if (amount <= 0) printf("Amount must be positive.\n");
            else if (amount > balance) printf("Insufficient funds.\n");
            else if (amount > 1000) printf("Daily limit is 1000.\n");
            else { balance -= amount; printf("Dispensed %.2f. Balance %.2f\n", amount, balance); }
        } else if (choice == 3) {
            printf("Amount: ");
            scanf("%lf", &amount);
            if (amount <= 0) printf("Amount must be positive.\n");
            else { balance += amount; printf("Deposited %.2f. Balance %.2f\n", amount, balance); }
        } else if (choice == 4) {
            printf("Thank you. Please take your card.\n");
            break;
        } else {
            printf("Unknown option.\n");
        }
    }
    return 0;
}
