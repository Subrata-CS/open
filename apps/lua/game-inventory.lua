-- title: Game inventory and crafting
-- level: intermediate
-- about: Carry weight, stacking and a crafting recipe check — the system behind every survival game.
-- tags: tables, metatables, logic

local Inventory = {}
Inventory.__index = Inventory

function Inventory.new(capacity)
  return setmetatable({ slots = {}, capacity = capacity, weight = 0 }, Inventory)
end

function Inventory:add(name, count, unitWeight)
  local added = count * unitWeight
  if self.weight + added > self.capacity then
    local canTake = math.floor((self.capacity - self.weight) / unitWeight)
    if canTake <= 0 then
      print(string.format("Cannot carry %s — %.1f/%.1f already", name, self.weight, self.capacity))
      return false
    end
    print(string.format("Only room for %d %s", canTake, name))
    count = canTake
  end
  self.slots[name] = (self.slots[name] or 0) + count
  self.weight = self.weight + count * unitWeight
  return true
end

function Inventory:has(needed)
  for item, n in pairs(needed) do
    if (self.slots[item] or 0) < n then return false, item end
  end
  return true
end

function Inventory:craft(name, recipe)
  local ok, missing = self:has(recipe)
  if not ok then
    print(string.format("Cannot craft %s — need more %s", name, missing))
    return
  end
  for item, n in pairs(recipe) do self.slots[item] = self.slots[item] - n end
  self.slots[name] = (self.slots[name] or 0) + 1
  print("Crafted: " .. name)
end

function Inventory:show()
  print(string.format("\nBAG  %.1f / %.1f kg", self.weight, self.capacity))
  local names = {}
  for item in pairs(self.slots) do names[#names + 1] = item end
  table.sort(names)
  for _, item in ipairs(names) do
    if self.slots[item] > 0 then
      print(string.format("  %-10s x%d", item, self.slots[item]))
    end
  end
end

local bag = Inventory.new(50)
bag:add("wood", 20, 1.5)
bag:add("iron", 8, 2.0)
bag:add("rope", 2, 0.5)
bag:add("stone", 30, 3.0)

bag:show()
bag:craft("axe", { wood = 3, iron = 2 })
bag:craft("bridge", { wood = 40, rope = 4 })
bag:show()
