#!/usr/bin/ruby

item_re = Regexp.new('<td style="(?:background: #(\w{6}); )?white-space:' +
                     ' nowrap;">(.*?)</td>')
category_re = Regexp.new('(?:<b>)?(\w)')
recent_re = Regexp.new("<i style='color: blue;'>(.*)</i>")
team_re = Regexp.new('(.*) (\w+)')
number_re = Regexp.new('&nbsp;(.*)&nbsp;')

download_time = open('latest.time.txt').read.strip

text = open('latest.html').read
if text.respond_to? 'encode!'
  text.encode!('UTF-16', 'UTF-8', :invalid => :replace, :replace => '')
  text.encode!('UTF-8', 'UTF-16')
else
  require 'iconv'
  ic = Iconv.new('UTF-8//IGNORE', 'UTF-8')
  text = ic.iconv(text + ' ')[0..-2]
end

team_adjust = {
  'ROWING CLUB MANTOVA' => 'Rowing Club Mantova'
}
color_adjust = {
  'Fitness Matters' => '383ec8',
  'Forum Flyers' => 'ab44d0',
  'Independent' => 'f253f2',
  'Paddy Power' => '2bdf2b',
  'Empty the Tanks' => 'ec321a'
}
team_colors = {}

out_file = open('latest.js', 'w')
out_file.write("var downloadTime = '%s';\n" % download_time)

out_file.write("var results = [")
items = text.scan(item_re)
comma = false
pos = 0
while pos < items.length
  rank = items[pos][1].to_i

  name = items[pos+1][1]
  recent = false
  if name.match(recent_re)
    recent = true
    name = name.match(recent_re)[1]
  end

  category = items[pos+2][1].match(category_re)[1]

  boat = items[pos+3][1]
  team = boat.match(team_re)[1]
  if team_adjust.include? team
    team = team_adjust[team]
  end

  if not team_colors.include? team
    if color_adjust.include? team
      color = color_adjust[team]
    else
      color = items[pos+3][0].downcase
    end
    team_colors[team] = color
  end
  boat_number = boat.match(team_re)[2]

  result = items[pos+4][1].match(number_re)[1].strip
  pace = items[pos+5][1].match(number_re)[1].strip
  power = items[pos+6][1].match(number_re)[1].strip

  out_file.write(("%s\n  { rank: %d, name: '%s', recent: %s, category: '%s'," + 
                  " team: '%s', boat_number: '%s', result: '%s', pace: '%s'," +
                  " power: '%s' }") % [comma ? ',' : '',
                      rank, name.gsub("'"){"\\'"}, recent, category,
                      team.gsub("'"){"\\'"}, boat_number, result, pace, power])
  comma = true
  pos += 7
end

out_file.write("\n];\n")

out_file.write("var teamColors = {")
comma = false
team_colors.each do |team, color|
  out_file.write("%s\n  '%s': '%s'" % [comma ? ',' : '', team, color])
  comma = true
end

out_file.write("\n};\n")
out_file.close()
