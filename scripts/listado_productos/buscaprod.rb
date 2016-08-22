Dir.glob("prod*").each do | filename |
   File.open(filename, "r") do | file |
      content = file.read
      total = content[/\"total\": (\d+)/, 1]
      #hayMas = total.to_i > 100
		#if (hayMas) then puts filename + ": " + total end
		if (total.to_i == 0) then puts filename end
   end
end
