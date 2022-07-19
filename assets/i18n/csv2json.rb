require 'csv'
require 'json'

print "Filename: "
filename = gets.chomp.sub(/"(.*)"/, '\\1')
print "Language code: "
code = gets.chomp

rows = CSV.read(filename)
header = rows.shift
Dir.mkdir(code) unless Dir.exist?(code)
language_col_index = header.index(code)
raise "Can't find #{code} in csv header" unless language_col_index

files = {}
rows.each do |row|
  text = row[language_col_index]
  root_key, key = row[0].split(':')
  files[root_key] ||= {}
  files[root_key][key] = text
end

files.each do |root_key, data|
  File.write(File.join(code, "#{root_key}.json"), JSON.pretty_generate(data))
end
