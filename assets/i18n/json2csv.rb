require 'csv'
require 'json'

keys = Dir['en/*.json'].map { |filename| filename.sub(/en\/(.*)\.json/, '\\1') }
CSV.open('translations.csv', 'w') do |csv|
  csv << ['key', 'fr', 'en', 'your_language']
  keys.each do |root_key|
    filename = "#{root_key}.json"
    en = JSON.parse(File.read(File.join('en', filename)))
    fr = File.exist?(File.join('fr', filename)) ? JSON.parse(File.read(File.join('fr', filename))) : {}
    en.each do |key, en_text|
      csv << ["#{root_key}:#{key}", fr[key] || 'Manquant', en_text, '']
    end
  end
end
