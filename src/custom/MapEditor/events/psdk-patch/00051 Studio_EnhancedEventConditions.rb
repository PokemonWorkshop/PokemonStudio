# ============================================================================
# Studio_EnhancedEventConditions — PSDK monkey patch (hand-authored)
# ----------------------------------------------------------------------------
# Extends RMXP event PAGE CONDITIONS with:
#   * switch conditions that can require OFF ("is FALSE"), not only ON
#   * variable conditions with a comparison operator (==, >=, <=, >, <)
#     instead of the hardcoded "value or above"
#   * a Ruby SCRIPT condition (must be truthy for the page to activate)
#   * a TIME-OF-DAY condition (day / night / morning / evening) via $env
#
# The extra data is stored by Pokémon Studio (forked) as additional instance
# variables on the RPG::Event::Page::Condition object inside Map###.rxdata:
#   @studio_switch1_expected  [Boolean]  expected state of switch 1
#   @studio_switch2_expected  [Boolean]  expected state of switch 2
#   @studio_variable_operator [Integer]  0: ==, 1: >=, 2: <=, 3: >, 4: <
#   @studio_script_condition  [String]   Ruby expression, must be truthy
#   @studio_time_condition    [String]   'day' | 'night' | 'morning' | 'evening'
# Ruby Marshal restores unknown ivars automatically, so vanilla files (and
# files re-saved by RMXP, which strips the ivars) simply fall back to the
# original semantics: switch must be ON, variable compared with >=.
#
# INSTALL: drop this file into your project's `scripts/` folder.
# ============================================================================

module Studio
  # Prepend for RPG::Event::Page::Condition#valid? honoring the enhanced ivars.
  module EnhancedEventConditions
    # Comparison operators for @studio_variable_operator
    OPERATORS = { 0 => :==, 1 => :>=, 2 => :<=, 3 => :>, 4 => :< }

    # Tell if the page condition is valid (enhanced version)
    # @param map_id [Integer] id of the map the event is on
    # @param event_id [Integer] id of the event
    # @return [Boolean]
    def valid?(map_id, event_id)
      if @switch1_valid
        expected = instance_variable_defined?(:@studio_switch1_expected) ? @studio_switch1_expected : true
        return false if $game_switches[@switch1_id] != expected
      end
      if @switch2_valid
        expected = instance_variable_defined?(:@studio_switch2_expected) ? @studio_switch2_expected : true
        return false if $game_switches[@switch2_id] != expected
      end
      if @variable_valid
        operator = instance_variable_defined?(:@studio_variable_operator) ? OPERATORS[@studio_variable_operator] : nil
        operator ||= :>=
        return false unless $game_variables[@variable_id].send(operator, @variable_value)
      end
      if @self_switch_valid
        return false unless $game_self_switches[[map_id, event_id, @self_switch_ch]]
      end
      if instance_variable_defined?(:@studio_time_condition) && @studio_time_condition
        return false unless studio_time_condition_met?(@studio_time_condition)
      end
      if instance_variable_defined?(:@studio_script_condition) && !@studio_script_condition.to_s.empty?
        return false unless studio_script_condition_met?(@studio_script_condition)
      end
      return true
    end

    private

    # @param slot [String] one of 'day' | 'night' | 'morning' | 'evening'
    # @return [Boolean]
    def studio_time_condition_met?(slot)
      case slot.to_s
      when 'day' then $env.day?
      when 'night' then $env.night?
      when 'morning' then $env.morning?
      when 'evening' then $env.sunset? # PSDK calls the evening slot "sunset"
      else true
      end
    end

    # Evaluate the Ruby script condition, failing closed on any error so a
    # bad expression never crashes the map — the page just stays inactive.
    # @param script [String]
    # @return [Boolean]
    def studio_script_condition_met?(script)
      eval(script) ? true : false
    rescue StandardError => e
      log_error("Studio script page condition failed: #{e.message}")
      false
    end
  end
end

RPG::Event::Page::Condition.prepend(Studio::EnhancedEventConditions)
