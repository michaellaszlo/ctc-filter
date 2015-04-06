#!/usr/bin/ruby

require 'net/http'

text = Net::HTTP.get('c2ctc.com', '/index.php')
file_name = 'latest.html'
file = open(file_name, 'w')
file.write(text)
file.close()

file = open('latest.time.txt', 'w')
file.write("%d\n" % [Time.new.to_i * 1000])
file.close()
