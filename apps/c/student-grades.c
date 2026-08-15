// title: Student grade report
// level: beginner
// about: Reads marks for a class, then prints an aligned report with averages, the topper and pass statistics.
// tags: arrays, structs, report

#include <stdio.h>
#include <string.h>

typedef struct { char name[24]; int marks[3]; } Student;

int main(void) {
    Student class[] = {
        {"Asha",   {91, 86, 78}},
        {"Rahul",  {74, 80, 69}},
        {"Meera",  {88, 79, 95}},
        {"Vikram", {55, 62, 48}},
    };
    int n = sizeof class / sizeof class[0];

    printf("%-10s %5s %5s %5s %8s %6s\n", "NAME", "DSA", "OS", "DBMS", "AVERAGE", "GRADE");
    printf("--------------------------------------------------\n");

    double best = -1; const char *topper = "";
    int passed = 0;

    for (int i = 0; i < n; i++) {
        int total = 0;
        for (int j = 0; j < 3; j++) total += class[i].marks[j];
        double avg = total / 3.0;

        char grade = avg >= 85 ? 'A' : avg >= 70 ? 'B' : avg >= 60 ? 'C' : 'F';
        if (grade != 'F') passed++;
        if (avg > best) { best = avg; topper = class[i].name; }

        printf("%-10s %5d %5d %5d %8.2f %6c\n",
               class[i].name, class[i].marks[0], class[i].marks[1], class[i].marks[2], avg, grade);
    }

    printf("--------------------------------------------------\n");
    printf("Topper : %s (%.2f)\n", topper, best);
    printf("Passed : %d of %d (%.0f%%)\n", passed, n, 100.0 * passed / n);
    return 0;
}
