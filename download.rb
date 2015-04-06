#!/usr/bin/ruby

require 'net/http'

text = Net::HTTP.get('c2ctc.com', '/index.php')
file_name = 'latest.html'
file = open(file_name, 'w')
file.write(text)
file.close()
