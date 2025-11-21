# InfoWorks ICM Ruby Scripting - Glossary

**Purpose:** Define all project-specific terms, acronyms, class names, and technical jargon used in InfoWorks ICM Ruby scripting.

**Last Updated:** October 21, 2025

---

## General Terms

### InfoWorks ICM
Integrated Catchment Modeling software by Innovyze (Autodesk) for hydraulic and hydrological simulation of urban drainage, wastewater, and water distribution systems.

### ICMExchange
Command-line application for running Ruby scripts with full database access outside the user interface.

### UI Script
Ruby script executed from within the InfoWorks ICM graphical user interface with access to the current network and UI features.

### Exchange Script
Ruby script executed via ICMExchange command line with full database access but no UI capabilities.

### Agent
Background service that manages and executes simulation runs, typically running on local or remote compute resources.

## Core API Classes

### WSApplication
Static class providing top-level application functionality including database operations, UI dialogs, and global settings. Entry point for most scripts.

### WSDatabase
Represents an open database connection providing access to model objects and database-level operations.

### WSModelObject
Any object in the database tree including model groups, networks, scenarios, runs, selection lists, and stored queries.

### WSOpenNetwork
An opened network instance that allows access to row objects and network data.

### WSRowObject
Individual object within a network such as a node, link, subcatchment, or other network element.

### WSNode
Specialized WSRowObject representing network nodes (manholes, junctions, outfalls, etc.).

### WSLink
Specialized WSRowObject representing network links (conduits, channels, pumps, weirs, etc.).

### WSStructure
Represents structured blob data fields containing multiple rows and columns (e.g., river reach sections, pump curves).

## Network Concepts

### Network
In InfoWorks ICM context, a database object containing tables of interconnected hydraulic/hydrological elements.

### Row Object
Individual element within a network (node, link, subcatchment, etc.) stored as a row in a database table.

### Scenario
Named variant of network data allowing comparison of different design or operational conditions.

### Selection List
Named collection of selected network objects for filtering and batch operations.

### Model Group
Container in the database tree for organizing related model objects.

## Network Element Types

### Node
Point object in the network representing manholes, junctions, outfalls, storage areas, etc.

### Link
Linear object connecting nodes representing conduits, channels, pumps, weirs, orifices, etc.

### Subcatchment
Area object representing a drainage catchment that contributes runoff to the network.

### Conduit
Closed pipe or culvert link.

### Channel
Open channel link.

### River Reach
Natural or artificial watercourse with variable cross-sections.

### 2D Zone
Area representing two-dimensional overland flow simulation domain.

## Common Abbreviations

### API
Application Programming Interface - methods and classes for programmatic access.

### CSV
Comma-Separated Values file format.

### GUI / UI
Graphical User Interface / User Interface.

### ID
Identifier - unique reference for an object.

### JSON
JavaScript Object Notation data format.

### ODIC / ODEC
Open Data Import Centre / Open Data Export Centre - framework for data exchange.

### SQL
Structured Query Language for database queries.

### SWMM
Storm Water Management Model (EPA model engine).

### UUID / GUID
Universally Unique Identifier / Globally Unique Identifier.

## Naming Conventions

### PascalCase
Capitalized words concatenated without separators (e.g., `WSApplication`, `ModelObject`). Used for classes and modules.

### snake_case
Lowercase words separated by underscores (e.g., `current_network`, `row_objects`). Used for methods and variables.

### SCREAMING_SNAKE_CASE
Uppercase words separated by underscores (e.g., `MAX_DIAMETER`, `DEBUG_MODE`). Used for constants.
