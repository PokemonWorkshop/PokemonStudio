if ARGV.first == 'gem'
  require './lib/__gem.rb'
elsif ARGV.first == 'bundle'
  require './lib/__bundle.rb'
else
  psdk_path =
    (Dir.exist?('pokemonsdk') && File.expand_path('pokemonsdk')) ||
    (ENV['PSDK_BINARY_PATH'] && File.join(ENV['PSDK_BINARY_PATH'].tr('\\', '/'), 'pokemonsdk')) ||
    ((ENV['APPDATA'] || ENV['HOME']).dup.force_encoding('UTF-8') + '/.pokemonsdk')
  require "#{psdk_path}/scripts/ScriptLoad.rb"
  ScriptLoader.load_tool('GameLoader/Z_load_uncompiled')
end
