# ============================================================================
# StatBoostAndHealItem — PSDK monkey patch (hand-authored, NOT Studio-generated)
# ----------------------------------------------------------------------------
# Adds a single item type that changes a battle stat stage AND changes HP in
# one use (stock PSDK forces you to pick one or the other). Studio (forked)
# writes items with `klass: "StatBoostAndHealItem"`; this file gives PSDK the
# data class + behavior so those items work.
#
# INSTALL: drop this file into your project's `scripts/` folder (any numeric
# prefix that loads after the engine — the default `scripts/` position is
# fine). One copy handles every item of this klass in the project.
#
# Item fields (set in Studio):
#   stat      — battle stat stage to change (:atk :dfe :ats :dfs :spd :eva :acc)
#   count     — number of stages (negative lowers)
#   hp_mode   — :constant or :rate
#   hp_count  — HP delta when hp_mode == :constant (negative damages)
#   hp_rate   — fraction of max HP when hp_mode == :rate (negative damages)
#   loyalty_malus — happiness lost on use (from HealingItem)
#
# Stat stages only exist in battle, so out of battle only the HP part applies.
# ============================================================================

module Studio
  # Data class describing an Item that changes a battle stat stage and HP.
  class StatBoostAndHealItem < HealingItem
    # Get the symbol of the stat stage to change
    # @return [Symbol] :atk, :dfe, :ats, :dfs, :spd, :eva, :acc
    attr_reader :stat
    # Get the number of stages to change (negative lowers)
    # @return [Integer]
    attr_reader :count
    # Get the HP change mode
    # @return [Symbol] :constant or :rate
    attr_reader :hp_mode
    # Get the flat HP delta (used when hp_mode == :constant; negative damages)
    # @return [Integer]
    attr_reader :hp_count
    # Get the HP delta as a fraction of max HP (used when hp_mode == :rate; negative damages)
    # @return [Float]
    attr_reader :hp_rate

    # Compute the HP delta this item applies to a given creature
    # @param creature [PFM::Pokemon]
    # @return [Integer]
    def hp_delta_for(creature)
      return (creature.max_hp * hp_rate).to_i if hp_mode == :rate

      return hp_count.to_i
    end
  end
end

# Usability: any non-egg, non-KO creature. We stay permissive because the item
# can heal, damage, or change a stage, and stat stages can't be inspected out
# of battle — so "will anything change" isn't reliably knowable here.
PFM::ItemDescriptor.define_on_creature_usability(Studio::StatBoostAndHealItem) do |_item, creature|
  next false if creature.egg?
  next false if creature.dead?

  next true
end

# Out-of-battle use: only the HP part applies (no stat stages on the map).
PFM::ItemDescriptor.define_on_creature_use(Studio::StatBoostAndHealItem) do |item, creature, scene|
  boost = Studio::StatBoostAndHealItem.from(item)
  creature.loyalty -= boost.loyalty_malus
  delta = boost.hp_delta_for(creature)
  next if delta == 0

  original_hp = creature.hp
  creature.hp += delta
  diff = creature.hp - original_hp
  next unless diff > 0

  message = parse_text(22, 109, PFM::Text::PKNICK[0] => creature.given_name, PFM::Text::NUM3[1] => diff.to_s)
  scene.display_message_and_wait(message)
end

# Battle use: apply BOTH the stat stage change and the HP change.
PFM::ItemDescriptor.define_on_creature_battler_use(Studio::StatBoostAndHealItem) do |item, creature, scene|
  boost = Studio::StatBoostAndHealItem.from(item)
  creature.loyalty -= boost.loyalty_malus

  # Stat stage change (respects prevention like Clear Body via _with_process)
  scene.logic.stat_change_handler.stat_change_with_process(boost.stat, boost.count, creature) if boost.count != 0 && boost.stat

  # HP change: positive heals, negative damages
  delta = boost.hp_delta_for(creature)
  if delta > 0
    scene.logic.damage_handler.heal(creature, delta, test_heal_block: false)
  elsif delta < 0
    scene.logic.damage_handler.damage_change(-delta, creature)
  end
end
