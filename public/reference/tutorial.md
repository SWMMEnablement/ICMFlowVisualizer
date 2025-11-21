# InfoWorks ICM Ruby Tutorial Context

**Last Updated:** October 21, 2025

## Quick Start

### Application Access
```ruby
# UI Scripts
net = WSApplication.current_network

# Exchange Scripts
db = WSApplication.open('path\\to\\database.icmm', false)
mo = db.model_object_from_type_and_id('Model Network', network_id)
net = mo.open
```

## Core Architecture

### Row Objects
```ruby
# Single object
node = net.row_object('hw_node', 'NODE_ID')
return if node.nil?

# Multiple objects
net.row_objects('hw_node').each do |node|
  puts "#{node.node_id}: #{node.x}, #{node.y}"
end

# Selected objects
selected = net.row_objects_selection('hw_node')
selected = net.row_objects('hw_node') if selected.empty?
```

## Data Modification

### Always Use Transactions
```ruby
net.transaction_begin
begin
  node.ground_level = 100.0
  node.write
rescue => e
  puts "Error: #{e}"
ensure
  net.transaction_commit
end
net.commit("Modified ground levels")
```

## Network Navigation

### Node Relationships
```ruby
node.us_links.each { |link| puts link.id }
node.ds_links.each { |link| puts link.id }
link.us_node  # upstream node
link.ds_node  # downstream node
```

## Selection and Tracing

### Selection Management
```ruby
net.clear_selection
node.selected = true
if node.selected?
  # Process selected
end
```

### Network Tracing
```ruby
unprocessed = []
node.ds_links.each do |link|
  link._seen = true
  unprocessed << link
end

while unprocessed.size > 0
  link = unprocessed.shift
  link.selected = true
  ds_node = link.ds_node
  next unless ds_node && !ds_node._seen
  
  ds_node._seen = true
  ds_node.selected = true
  ds_node.ds_links.each do |next_link|
    next if next_link._seen
    next_link._seen = true
    unprocessed << next_link
  end
end

# Clean up _seen flags after tracing!
net.row_objects('_links').each { |o| o._seen = false }
net.row_objects('_nodes').each { |o| o._seen = false }
```

## Results Handling

### Accessing Simulation Results
```ruby
net = WSApplication.current_network

net.row_objects('hw_node').each do |node|
  depth = node.results('depnod')
  puts "#{node.id}: Max depth = #{depth.max}"
end
```

### Comparing Two Simulations
```ruby
cn = WSApplication.current_network      # Current
bn = WSApplication.background_network   # Background

cn.row_objects('hw_node').each do |cn_node|
  bn_node = bn.row_object('hw_node', cn_node.id)
  cn_depth = cn_node.results('depnod').max
  bn_depth = bn_node.results('depnod').max
  puts "#{cn_node.id}: #{cn_depth} vs #{bn_depth}"
end
```

## Error Handling

### Basic Error Handling
```ruby
begin
  # Your code...
rescue => e
  puts "Error class: #{e.class}"
  puts "Message: #{e.message}"
  puts e.backtrace.join("\n")
end
```

### Safe Navigation
```ruby
node = net.row_object('hw_node', 'MH001')&.write  # Only write if found
```

## Ruby Environment

### What Works
- Data structures: Array, Hash, Set
- Libraries: require 'csv', 'date', 'set', 'json'
- String/Numeric operations: .to_s, .to_f, .round, .upcase, .strip, etc.
- Collections: .each, .map, .select, .compact, .find, etc.
- File I/O: File.read, File.write (use absolute paths!)
- Math: Math.sqrt, Math::PI

### Limitations
- No external gems (nokogiri, etc.)
- Console input doesn't work in UI scripts
- File paths: Always use absolute paths
- Ruby 2.4.0 embedded version

## Common Errors

### "undefined method 'current_network'"
You're in Exchange context. Use `WSApplication.open(path)` instead.

### "NoMethodError: undefined method 'write' for nil:NilClass"
Object lookup returned nil. Always check: `return if node.nil?`

### "collection modified during iteration"
Convert to array first: `.to_a.each { ... }`

### Changes Not Saved
Missing write() call. Every modification needs: `node.write`

### Database is locked
Close the database in InfoWorks UI or wrap in ensure block to guarantee cleanup.
