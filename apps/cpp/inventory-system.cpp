// title: Shop inventory system
// level: intermediate
// about: Stock levels, reorder alerts and a restock queue — the core of every point-of-sale system.
// tags: maps, classes, sorting

#include <iostream>
#include <iomanip>
#include <map>
#include <string>
#include <vector>
#include <algorithm>

struct Item { std::string name; int qty; double price; int reorderAt; };

class Inventory {
    std::map<std::string, Item> items;
public:
    void add(const Item& i) { items[i.name] = i; }

    bool sell(const std::string& name, int n) {
        auto it = items.find(name);
        if (it == items.end() || it->second.qty < n) return false;
        it->second.qty -= n;
        return true;
    }

    double value() const {
        double total = 0;
        for (const auto& [name, i] : items) total += i.qty * i.price;
        return total;
    }

    std::vector<Item> needRestock() const {
        std::vector<Item> out;
        for (const auto& [name, i] : items)
            if (i.qty <= i.reorderAt) out.push_back(i);
        std::sort(out.begin(), out.end(),
                  [](const Item& a, const Item& b) { return a.qty < b.qty; });
        return out;
    }

    void report() const {
        std::cout << std::left << std::setw(14) << "ITEM"
                  << std::right << std::setw(6) << "QTY"
                  << std::setw(10) << "PRICE"
                  << std::setw(11) << "VALUE" << "\n";
        std::cout << std::string(41, '-') << "\n";
        for (const auto& [name, i] : items)
            std::cout << std::left << std::setw(14) << i.name
                      << std::right << std::setw(6) << i.qty
                      << std::setw(10) << std::fixed << std::setprecision(2) << i.price
                      << std::setw(11) << i.qty * i.price << "\n";
    }
};

int main() {
    Inventory shop;
    shop.add({"notebook", 40, 45.00, 10});
    shop.add({"pen",     120, 10.00, 30});
    shop.add({"eraser",    8,  5.00, 10});
    shop.add({"marker",   25, 35.00, 15});

    shop.sell("pen", 95);
    shop.sell("notebook", 32);
    if (!shop.sell("eraser", 50)) std::cout << "Cannot sell 50 erasers — not enough stock.\n\n";

    shop.report();
    std::cout << std::string(41, '-') << "\n";
    std::cout << "Stock value: " << std::fixed << std::setprecision(2) << shop.value() << "\n\n";

    std::cout << "RESTOCK NEEDED\n";
    for (const auto& i : shop.needRestock())
        std::cout << "  " << i.name << " — " << i.qty << " left, reorder at " << i.reorderAt << "\n";
    return 0;
}
