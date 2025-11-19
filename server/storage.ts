import { type WorkflowDefinition, type LogEntry } from "@shared/schema";

export interface IStorage {
  getWorkflowDefinition(): Promise<WorkflowDefinition>;
  getLogs(): Promise<LogEntry[]>;
}

export class MemStorage implements IStorage {
  private workflowDefinition: WorkflowDefinition;
  private logs: LogEntry[];

  constructor() {
    this.workflowDefinition = this.initializeWorkflowData();
    this.logs = this.initializeLogs();
  }

  async getWorkflowDefinition(): Promise<WorkflowDefinition> {
    return this.workflowDefinition;
  }

  async getLogs(): Promise<LogEntry[]> {
    return this.logs;
  }

  private initializeWorkflowData(): WorkflowDefinition {
    return {
      nodes: [
        { id: 'start', type: 'start', label: 'Start', position: { x: 100, y: 50 } },
        
        { id: 'welcome', type: 'process', label: 'Welcome Screen', description: 'Display welcome message and ask user to continue', script: 'ui', position: { x: 100, y: 150 }, metadata: { methodName: 'show_welcome_dialog', codeSnippet: '# ==============================================================================\n# STEP 1: USER GREETING\n# ==============================================================================\n\n# API NOTE: WSApplication.message_box displays a modal dialog.\n# Signature: message_box(message_text, button_code, icon_code)\n# Button codes: "OK", "YN" (Yes/No), "YNC" (Yes/No/Cancel)\n# Icon codes: "?" (question), "!" (warning), "i" (info)\n# Returns: String button name that was clicked (e.g., "Yes", "No")\n\nresult = WSApplication.message_box(\n  "SWMM5 Import to ICM InfoWorks\\nVersion 2.0\\n\\n" +\n  "This utility imports standard EPA SWMM5 .inp files into ICM.\\n" +\n  "It supports batch processing and automated label cleanup.\\n\\n" +\n  "Ready to proceed?",\n  "YN",   # Yes/No buttons\n  "?"     # Question mark icon\n)\n\n# Graceful exit if the user declines\nif result == "No"\n  puts "Script terminated by user at welcome screen."\n  exit\nend' } },
        
        { id: 'mode_select', type: 'decision', label: 'Select Import Mode', description: 'Choose: Single File, Batch - Directory Only, or Batch - Include Subdirectories', script: 'ui', position: { x: 100, y: 280 }, metadata: { methodName: 'select_import_mode', codeSnippet: '# ==============================================================================\n# STEP 2: IMPORT MODE SELECTION\n# ==============================================================================\n\n# API NOTE: WSApplication.prompt takes an array of arrays to build a form.\n# Format: [\'Label Text\', \'Data Type\', Default Value]\n# Data Types: \'STRING\', \'BOOLEAN\' (checkbox), \'NUMBER\', \'READONLY\'\nlayout = [\n  [\'Select Import Mode (check ONE):\', \'READONLY\', \'\'],\n  [\'1. Single File\', \'BOOLEAN\', true],                # Boolean renders as Checkbox\n  [\'2. Batch - Directory Only\', \'BOOLEAN\', false],\n  [\'3. Batch - Include Subdirectories\', \'BOOLEAN\', false]\n]\n\nresult = WSApplication.prompt(\'Import Configuration\', layout, false)\n\n# Handle "Cancel" button or closing the window (result becomes nil)\nif result.nil?\n  puts "Script terminated by user at mode selection."\n  exit\nend\n\n# Parse the form results. result[1] is the first checkbox, etc.\nif result[1]\n  import_mode = \'Single File\'\nelsif result[2]\n  import_mode = \'Batch - Directory Only\'\nelsif result[3]\n  import_mode = \'Batch - Include Subdirectories\'\nelse\n  import_mode = \'Single File\' # Fallback default\nend' } },
        
        { id: 'file_select', type: 'process', label: 'Select Files/Directory', description: 'Use file dialog to select .inp files or directory', script: 'ui', position: { x: 100, y: 430 }, metadata: { methodName: 'select_files', codeSnippet: '# ==============================================================================\n# STEP 3: FILE SELECTION LOGIC\n# ==============================================================================\n\nfile_paths = []\nbase_directory = nil\n\ncase import_mode\nwhen \'Single File\'\n  # API NOTE: WSApplication.file_dialog triggers the native Windows file picker.\n  # Args: (Open?, Filter, Title, DefaultFile, MultiSelect?, ParentWindow)\n  file_path = WSApplication.file_dialog(\n    true,                 # Open mode (vs. Save)\n    \'inp\',                # File extension filter\n    \'Select SWMM5 Input File\',\n    \'\',                   # Default filename (empty)\n    false,                # Disable multi-select\n    nil\n  )\n  \n  if file_path.nil?\n    WSApplication.message_box("No file selected. Exiting.", "OK", "!")\n    exit\n  end\n  \n  file_paths << file_path\n  base_directory = File.dirname(file_path)\n\nwhen \'Batch - Directory Only\', \'Batch - Include Subdirectories\'\n  # WORKAROUND: ICM Ruby API lacks a specific "Select Folder" dialog.\n  # We ask the user to select a "dummy" file within the target folder\n  # to resolve the path.\n  sample_file = WSApplication.file_dialog(true, \'*\', \n    \'Pick reference file for folder path\', \'\', false, nil)\n  \n  exit if sample_file.nil?\n  \n  # Strip the filename to get the directory\n  base_directory = File.dirname(sample_file)\n  \n  # Determine recursion requirement\n  is_recursive = (import_mode == \'Batch - Include Subdirectories\')\n  \n  # Populate the file list\n  file_paths = find_inp_files(base_directory, is_recursive)\n  \n  # Validation: Ensure we actually have work to do\n  if file_paths.empty?\n    WSApplication.message_box("No .inp files found in: #{base_directory}", "OK", "!")\n    exit\n  end\n  \n  puts "Queue size: #{file_paths.length} files"\nend' } },
        
        { id: 'size_check', type: 'decision', label: 'Size > 100MB?', description: 'Calculate total file size and warn if large batch', script: 'ui', position: { x: 100, y: 560 }, metadata: { methodName: 'check_file_sizes', codeSnippet: '# ==============================================================================\n# STEP 4: PERFORMANCE CHECK (UX)\n# ==============================================================================\n# Large imports can freeze the computer. We calculate total MB to warn the user.\n\ntotal_size_mb = 0.0\nfile_paths.each do |file|\n  # Bytes -> MB conversion\n  total_size_mb += File.size(file) / (1024.0 * 1024.0)\nend\n\nif total_size_mb > 100\n  response = WSApplication.message_box(\n    "Performance Warning:\\nTotal import size is #{total_size_mb.round(1)} MB.\\n" +\n    "This process may take several minutes. Continue?",\n    "YN",   # Yes/No buttons\n    "?"     # Question icon\n  )\n  exit if response == "No"\nend' } },
        
        { id: 'naming', type: 'process', label: 'Define Model Group Names', description: 'Set naming convention for imported model groups', script: 'ui', position: { x: 100, y: 710 }, metadata: { methodName: 'configure_naming', codeSnippet: '# ==============================================================================\n# STEP 5: MODEL GROUP NAMING STRATEGY\n# ==============================================================================\n# We need to determine the name of the "Model Group" (the folder icon in the\n# DB tree) where the data will land.\n\nmodel_group_names = []\n\nif import_mode == \'Single File\'\n  # Suggest the filename as the default Model Group name\n  default_name = File.basename(file_paths.first, \'.inp\')\n  \n  result = WSApplication.prompt(\n    \'Target Name Settings\',\n    [\n      [\'Model Group Name:\', \'STRING\', default_name],\n      [\'Append Timestamp (prevents duplicates)?\', \'BOOLEAN\', true]\n    ],\n    false\n  )\n  exit if result.nil?\n  \n  final_name = result[0]\n  final_name += "_#{Time.now.strftime("%Y%m%d_%H%M")}" if result[1]\n  \n  model_group_names << final_name\n\nelse\n  # Batch Mode: Ask for a naming convention\n  use_dir_name = WSApplication.message_box(\n    "Naming Convention:\\nPrefix Model Group names with their parent folder name?\\n" +\n    "(Useful if filenames like \'Scenario1.inp\' are repeated in different folders)",\n    "YN",   # Yes/No buttons\n    "?"     # Question icon\n  ) == "Yes"\n  \n  file_paths.each do |file_path|\n    filename = File.basename(file_path, \'.inp\')\n    \n    if use_dir_name\n      # Format: ParentFolder_FileName\n      parent = File.basename(File.dirname(file_path))\n      name = "#{parent}_#{filename}"\n    else\n      # Format: FileName\n      name = filename\n    end\n    \n    model_group_names << name\n  end\nend' } },
        
        { id: 'config_file', type: 'data', label: 'import_config.yaml', description: 'Configuration file with all import settings', position: { x: 100, y: 840 }, metadata: { codeSnippet: '# ==============================================================================\n# STEP 6: GENERATE CONFIGURATION MANIFEST\n# ==============================================================================\n# The UI script and the Exchange script are two separate processes. They do not\n# share memory. We bridge them by writing a YAML file to disk.\n\n# 1. Get current DB identifier so the worker knows where to connect.\ndb_guid = WSApplication.current_database.guid\n\n# 2. Setup Log/Config directory\nconfig_folder = File.join(base_directory, "ICM Import Log Files")\nDir.mkdir(config_folder) unless Dir.exist?(config_folder)\n\n# 3. Build the "Job List"\nfile_configs = []\nfile_paths.each_with_index do |file_path, index|\n  file_configs << {\n    \'file_path\' => file_path,\n    \'model_group_name\' => model_group_names[index],\n    \'file_basename\' => File.basename(file_path)\n  }\nend\n\n# 4. Build the master config hash\nconfig = {\n  \'import_mode\' => import_mode,\n  \'file_configs\' => file_configs,\n  \'database_guid\' => db_guid,\n  \'cleanup_empty_label_lists\' => true,  # Hardcoded preference\n  \'timestamp\' => Time.now.to_s\n}\n\n# 5. Serialize to disk\nconfig_file = File.join(config_folder, \'import_config.yaml\')\nFile.open(config_file, \'w\') { |f| f.write(config.to_yaml) }\n\nputs "Manifest file created at: #{config_file}"' } },
        
        { id: 'env_var', type: 'process', label: 'Set Environment Variable', description: 'Store config file path in ICM_IMPORT_CONFIG', script: 'ui', position: { x: 100, y: 940 }, metadata: { methodName: 'set_environment', codeSnippet: 'config_path = File.absolute_path("import_config.yaml")\nENV["ICM_IMPORT_CONFIG"] = config_path\nWSApplication.set_env_var("ICM_IMPORT_CONFIG", config_path)' } },
        
        { id: 'launch_exchange', type: 'process', label: 'Launch ICMExchange.exe', description: 'Execute Exchange script in headless mode', script: 'ui', position: { x: 100, y: 1070 }, metadata: { methodName: 'launch_exchange_script', codeSnippet: '# ==============================================================================\n# STEP 7: EXECUTE BACKGROUND PROCESS\n# ==============================================================================\n\n# Locate the worker script\nexchange_script = File.join(script_dir, \'SWMM5_Import_Exchange_Annotated.rb\')\nunless File.exist?(exchange_script)\n  WSApplication.message_box(\n    "CRITICAL ERROR:\\nMissing companion script.\\n" +\n    "Ensure both scripts are in the same folder.",\n    "OK", "!"\n  )\n  exit\nend\n\n# Locate the ICM Execution Engine (ICMExchange.exe).\n# This path varies by version.\nicm_exchange = nil\npossible_paths = [\n  "C:\\\\Program Files\\\\Autodesk\\\\InfoWorks ICM Ultimate 2026\\\\ICMExchange.exe",\n  "C:\\\\Program Files\\\\Autodesk\\\\InfoWorks ICM Ultimate 2025\\\\ICMExchange.exe"\n]\n\npossible_paths.each do |path|\n  if File.exist?(path)\n    icm_exchange = path\n    break\n  end\nend\n\nif icm_exchange.nil?\n  WSApplication.message_box(\n    "System Path Error:\\nCould not locate ICMExchange.exe.",\n    "OK", "!"\n  )\n  exit\nend\n\n# Set Environment Variable.\n# This is how we pass the path of the YAML file to the new process.\nENV[\'ICM_IMPORT_CONFIG\'] = config_file\n\n# Build the Command Line string.\n# Syntax: "PathToExecutable" "PathToRubyScript" /ICM\ncommand = "\\"#{icm_exchange}\\" \\"#{exchange_script}\\" /ICM"\n\nputs "Running background command..."\nOpen3.popen3(command) do |stdin, stdout, stderr, wait_thr|\n  # Process runs asynchronously\nend' } },
        
        { id: 'retrieve_config', type: 'process', label: 'Retrieve Configuration', description: 'Read config from ENV variable or search filesystem', script: 'exchange', position: { x: 500, y: 50 }, metadata: { methodName: 'load_config', codeSnippet: 'config_path = ENV["ICM_IMPORT_CONFIG"] ||\n  Dir.glob("**/import_config.yaml").first\nconfig = YAML.load_file(config_path)\nfiles = config[:files]' } },
        
        { id: 'connect_db', type: 'process', label: 'Connect to Database', description: 'Open ICM database using WSApplication', script: 'exchange', position: { x: 500, y: 180 }, metadata: { methodName: 'open_network', codeSnippet: 'net = WSApplication.current_network\nif net.nil?\n  raise "No network open in ICM"\nend\ndb = net.odic_database' } },
        
        { id: 'start_log', type: 'process', label: 'Start Log File', description: 'Create timestamped log file in ICM Import Log Files folder', script: 'exchange', position: { x: 500, y: 310 }, metadata: { methodName: 'initialize_log', codeSnippet: 'timestamp = Time.now.strftime("%Y%m%d_%H%M%S")\nlog_file = "ICM_Import_#{timestamp}.log"\nlog_path = File.join(log_folder, log_file)\n@log = File.open(log_path, "w")' } },
        
        { id: 'loop_start', type: 'process', label: 'For Each File in Batch', description: 'Main processing loop through all configured files', script: 'exchange', position: { x: 500, y: 440 }, metadata: { methodName: 'process_batch', codeSnippet: 'files.each_with_index do |file_path, index|\n  log("Processing #{index + 1} of #{files.size}: #{file_path}")\n  process_single_file(file_path)\nend' } },
        
        { id: 'file_exists', type: 'decision', label: 'File Exists?', description: 'Check if .inp file is accessible', script: 'exchange', position: { x: 500, y: 570 }, metadata: { codeSnippet: 'unless File.exist?(file_path)\n  log("ERROR: File not found: #{file_path}")\n  next\nend' } },
        
        { id: 'create_model_group', type: 'process', label: 'Create Model Group', description: 'Create container in database tree', script: 'exchange', position: { x: 700, y: 690 }, metadata: { methodName: 'create_model_group', codeSnippet: 'model_group = net.new_model_object("Model Group")\nmodel_group.id = model_group_name\nmodel_group.write\nnet.current_model_object = model_group' } },
        
        { id: 'import_data', type: 'process', label: 'Import .inp File', description: 'Execute import_all_sw_model_objects()', script: 'exchange', position: { x: 700, y: 820 }, metadata: { methodName: 'import_swmm_file', codeSnippet: '# ==============================================================================\n# CORE IMPORT OPERATION\n# ==============================================================================\n# This is the critical step where ICM reads the .inp file and creates\n# objects in the database.\n\n# API NOTE: import_all_sw_model_objects is the ICM Ruby method that:\n#   1. Parses the SWMM5 .inp file format\n#   2. Creates nodes, links, subcatchments, and other hydraulic objects\n#   3. Populates attributes from the file sections\n#   4. Returns a collection of newly created objects\n\nbegin\n  log("Starting import: #{file_path}")\n  \n  # Execute the import\n  imported_objects = net.import_all_sw_model_objects(\n    file_path,\n    false  # false = Don\'t delete existing objects\n           # true would clear the model group first (destructive!)\n  )\n  \n  # Validation: Check that import returned something\n  if imported_objects.nil? || imported_objects.count == 0\n    raise "Import returned no objects - file may be empty or corrupt"\n  end\n  \n  log("Successfully imported #{imported_objects.count} objects")\n  \nrescue => e\n  log("IMPORT FAILED: #{e.message}")\n  raise  # Re-raise to trigger error handler\nend' } },
        
        { id: 'gather_stats', type: 'process', label: 'Gather Statistics', description: 'Count nodes, links, subcatchments', script: 'exchange', position: { x: 700, y: 950 }, metadata: { methodName: 'collect_statistics', codeSnippet: '# ==============================================================================\n# GATHER IMPORT STATISTICS\n# ==============================================================================\n# After import, we count what was created for reporting.\n\n# API NOTE: row_object_collection returns a live query of database objects.\n# Common table names in ICM SWMM networks:\n#   "_nodes" -> All node types (manholes, junctions, outfalls)\n#   "_links" -> All link types (conduits, pumps, orifices, weirs)\n#   "sw_subcatchment" -> Catchment/subcatchment polygons\n#   "hw_node" -> Additional InfoWorks-specific nodes\n\nstats = {\n  nodes: net.row_object_collection("_nodes").count,\n  links: net.row_object_collection("_links").count,\n  subcatchments: net.row_object_collection("sw_subcatchment").count,\n  storages: net.row_object_collection("hw_storage").count,\n  pumps: net.row_object_collection("hw_pump").count\n}\n\nlog("Import Statistics:")\nlog("  - Nodes: #{stats[:nodes]}")\nlog("  - Links: #{stats[:links]}")\nlog("  - Subcatchments: #{stats[:subcatchments]}")\n\n# Store stats for batch summary\n@batch_stats << {\n  file: file_basename,\n  stats: stats,\n  timestamp: Time.now\n}' } },
        
        { id: 'cleanup', type: 'decision', label: 'Cleanup Empty Label Lists?', description: 'Remove empty label lists if configured', script: 'exchange', position: { x: 700, y: 1080 }, metadata: { methodName: 'cleanup_label_lists', codeSnippet: 'if config[:cleanup_empty_lists]\n  net.label_lists.each do |list|\n    if list.labels.empty?\n      list.delete\n      log("Deleted empty label list: #{list.id}")\n    end\n  end\nend' } },
        
        { id: 'validate', type: 'decision', label: 'Run Validation?', description: 'Optional validation checks on imported network', script: 'exchange', position: { x: 700, y: 1210 }, metadata: { codeSnippet: 'if config[:run_validation]\n  validator = net.validate_all\n  errors = validator.errors\n  log("Validation: #{errors.count} errors")\nend' } },
        
        { id: 'error_handler', type: 'process', label: 'Error Handler (Rescue)', description: 'Log error, cleanup partial imports, continue to next file', script: 'exchange', position: { x: 300, y: 690 }, status: 'warning', metadata: { codeSnippet: '# ==============================================================================\n# ERROR RECOVERY STRATEGY\n# ==============================================================================\n# In batch processing, a single failure should not crash the entire job.\n# We catch exceptions, log diagnostics, and continue with remaining files.\n\nrescue StandardError => e\n  # Log the error with full context\n  log("\\n" + "="*70)\n  log("IMPORT FAILED: #{file_basename}")\n  log("="*70)\n  log("Error Type: #{e.class}")\n  log("Message: #{e.message}")\n  log("Stack Trace:")\n  log(e.backtrace.join("\\n  "))\n  log("="*70 + "\\n")\n  \n  # Track failure for summary report\n  @failed_files << {\n    file: file_basename,\n    path: file_path,\n    error: e.message,\n    error_type: e.class.to_s,\n    timestamp: Time.now\n  }\n  \n  # IMPORTANT: Use \'next\' to skip to next file in loop\n  # Do NOT use \'exit\' or \'raise\' here - we want to continue!\n  next\nend' } },
        
        { id: 'loop_end', type: 'process', label: 'Next File', description: 'Continue to next file in batch', script: 'exchange', position: { x: 500, y: 1340 } },
        
        { id: 'summary', type: 'process', label: 'Write Summary File', description: 'Create batch_summary.txt with final statistics', script: 'exchange', position: { x: 500, y: 1470 }, metadata: { methodName: 'write_summary', codeSnippet: '# ==============================================================================\n# FINAL SUMMARY REPORT\n# ==============================================================================\n# After processing all files, generate a summary document for the user.\n\n# Calculate totals\nsuccess_count = file_configs.size - @failed_files.size\ntotal_nodes = @batch_stats.sum { |s| s[:stats][:nodes] }\ntotal_links = @batch_stats.sum { |s| s[:stats][:links] }\n\n# Build formatted report\nsummary = []\nsummary << "="*70\nsummary << "SWMM5 BATCH IMPORT SUMMARY"\nsummary << "="*70\nsummary << "Timestamp: #{Time.now}"\nsummary << "Import Mode: #{config[\'import_mode\']}"\nsummary << ""\nsummary << "RESULTS:"\nsummary << "  Total Files: #{file_configs.size}"\nsummary << "  Successful: #{success_count}"\nsummary << "  Failed: #{@failed_files.size}"\nsummary << ""\nsummary << "OBJECTS CREATED:"\nsummary << "  Total Nodes: #{total_nodes}"\nsummary << "  Total Links: #{total_links}"\nsummary << ""\n\nif @failed_files.any?\n  summary << "FAILED FILES:"\n  @failed_files.each do |f|\n    summary << "  - #{f[:file]}: #{f[:error]}"\n  end\nend\n\nsummary << "="*70\n\n# Write to file\nsummary_path = File.join(config_folder, "batch_summary.txt")\nFile.write(summary_path, summary.join("\\n"))\n\nlog("Summary written to: #{summary_path}")' } },
        
        { id: 'end', type: 'end', label: 'End', position: { x: 500, y: 1600 } },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'welcome', type: 'primary' },
        { id: 'e2', source: 'welcome', target: 'mode_select', type: 'primary' },
        { id: 'e3', source: 'mode_select', target: 'file_select', type: 'primary' },
        { id: 'e4', source: 'file_select', target: 'size_check', type: 'primary' },
        { id: 'e5', source: 'size_check', target: 'naming', type: 'primary', label: 'Continue' },
        { id: 'e6', source: 'naming', target: 'config_file', type: 'primary' },
        { id: 'e7', source: 'config_file', target: 'env_var', type: 'primary' },
        { id: 'e8', source: 'env_var', target: 'launch_exchange', type: 'primary' },
        { id: 'e9', source: 'launch_exchange', target: 'retrieve_config', type: 'primary', label: 'Background Process' },
        { id: 'e10', source: 'retrieve_config', target: 'connect_db', type: 'primary' },
        { id: 'e11', source: 'connect_db', target: 'start_log', type: 'primary' },
        { id: 'e12', source: 'start_log', target: 'loop_start', type: 'primary' },
        { id: 'e13', source: 'loop_start', target: 'file_exists', type: 'primary' },
        { id: 'e14', source: 'file_exists', target: 'create_model_group', type: 'primary', label: 'Yes' },
        { id: 'e15', source: 'file_exists', target: 'error_handler', type: 'conditional', label: 'No' },
        { id: 'e16', source: 'create_model_group', target: 'import_data', type: 'primary' },
        { id: 'e17', source: 'import_data', target: 'gather_stats', type: 'primary' },
        { id: 'e18', source: 'gather_stats', target: 'cleanup', type: 'primary' },
        { id: 'e19', source: 'cleanup', target: 'validate', type: 'primary' },
        { id: 'e20', source: 'validate', target: 'loop_end', type: 'primary' },
        { id: 'e21', source: 'error_handler', target: 'loop_end', type: 'conditional' },
        { id: 'e22', source: 'loop_end', target: 'loop_start', type: 'conditional', label: 'More Files' },
        { id: 'e23', source: 'loop_end', target: 'summary', type: 'primary', label: 'All Done' },
        { id: 'e24', source: 'summary', target: 'end', type: 'primary' },
      ],
      statistics: {
        filesProcessed: 12,
        filesSuccessful: 10,
        filesFailed: 2,
        totalNodes: 487,
        totalLinks: 623,
        totalSubcatchments: 145,
        totalLabelListsDeleted: 8,
        failedFiles: [
          { file: 'basin_03.inp', reason: 'File not found' },
          { file: 'network_07.inp', reason: 'Import returned no objects' }
        ]
      },
      fileConfigs: [
        { id: 'f1', fileName: 'basin_01.inp', filePath: 'C:\\Projects\\SWMM\\basin_01.inp', fileSize: 245760, modelGroupName: 'Basin_01', status: 'success' },
        { id: 'f2', fileName: 'basin_02.inp', filePath: 'C:\\Projects\\SWMM\\basin_02.inp', fileSize: 189440, modelGroupName: 'Basin_02', status: 'success' },
        { id: 'f3', fileName: 'basin_03.inp', filePath: 'C:\\Projects\\SWMM\\basin_03.inp', modelGroupName: 'Basin_03', status: 'error' },
        { id: 'f4', fileName: 'network_04.inp', filePath: 'C:\\Projects\\SWMM\\network_04.inp', fileSize: 512000, modelGroupName: 'Network_04', status: 'success' },
        { id: 'f5', fileName: 'network_05.inp', filePath: 'C:\\Projects\\SWMM\\network_05.inp', fileSize: 387200, modelGroupName: 'Network_05', status: 'success' },
        { id: 'f6', fileName: 'network_06.inp', filePath: 'C:\\Projects\\SWMM\\network_06.inp', fileSize: 421888, modelGroupName: 'Network_06', status: 'warning' },
        { id: 'f7', fileName: 'network_07.inp', filePath: 'C:\\Projects\\SWMM\\network_07.inp', modelGroupName: 'Network_07', status: 'error' },
      ]
    };
  }

  private initializeLogs(): LogEntry[] {
    return [
      { timestamp: '2024-01-15 14:23:01', level: 'INFO', message: 'SWMM5 Import Log - Starting batch process' },
      { timestamp: '2024-01-15 14:23:01', level: 'INFO', message: 'Files to process: 12' },
      { timestamp: '2024-01-15 14:23:02', level: 'INFO', message: 'Processing file 1 of 12: basin_01.inp', file: 'basin_01.inp' },
      { timestamp: '2024-01-15 14:23:05', level: 'SUCCESS', message: 'Imported 487 items successfully', file: 'basin_01.inp' },
      { timestamp: '2024-01-15 14:23:05', level: 'INFO', message: 'Stats: Nodes: 87, Links: 112', file: 'basin_01.inp' },
      { timestamp: '2024-01-15 14:23:06', level: 'INFO', message: 'Processing file 2 of 12: basin_02.inp', file: 'basin_02.inp' },
      { timestamp: '2024-01-15 14:23:09', level: 'SUCCESS', message: 'Imported 423 items successfully', file: 'basin_02.inp' },
      { timestamp: '2024-01-15 14:23:10', level: 'INFO', message: 'Processing file 3 of 12: basin_03.inp', file: 'basin_03.inp' },
      { timestamp: '2024-01-15 14:23:10', level: 'ERROR', message: 'File not found: C:\\Projects\\SWMM\\basin_03.inp', file: 'basin_03.inp' },
      { timestamp: '2024-01-15 14:23:11', level: 'WARNING', message: 'Skipping to next file', file: 'basin_03.inp' },
      { timestamp: '2024-01-15 14:23:11', level: 'INFO', message: 'Processing file 4 of 12: network_04.inp', file: 'network_04.inp' },
      { timestamp: '2024-01-15 14:23:18', level: 'SUCCESS', message: 'Imported 891 items successfully', file: 'network_04.inp' },
      { timestamp: '2024-01-15 14:23:18', level: 'INFO', message: 'Cleanup: Removed 3 empty label lists', file: 'network_04.inp' },
      { timestamp: '2024-01-15 14:23:45', level: 'INFO', message: 'FINAL SUMMARY - Processed: 12, Success: 10, Failed: 2' },
    ];
  }
}

export const storage = new MemStorage();
