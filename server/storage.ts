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
        
        { id: 'welcome', type: 'process', label: 'Welcome Screen', description: 'Display welcome message and ask user to continue', script: 'ui', position: { x: 100, y: 150 }, metadata: { methodName: 'show_welcome_dialog', codeSnippet: 'message_box("Welcome to SWMM5 Batch Import", "OK", "c")\nWSApplication.message_box("Ready to import?", "YN", "?")' } },
        
        { id: 'mode_select', type: 'decision', label: 'Select Import Mode', description: 'Choose: Single File, Batch - Directory Only, or Batch - Include Subdirectories', script: 'ui', position: { x: 100, y: 280 }, metadata: { methodName: 'select_import_mode', codeSnippet: 'mode = WSApplication.input_box(\n  "Select mode:",\n  ["Single File", "Batch - Directory Only", "Batch - Subdirectories"],\n  "Single File"\n)' } },
        
        { id: 'file_select', type: 'process', label: 'Select Files/Directory', description: 'Use file dialog to select .inp files or directory', script: 'ui', position: { x: 100, y: 430 }, metadata: { methodName: 'select_files', codeSnippet: 'files = WSApplication.file_dialog(\n  true,\n  "inp",\n  "Select SWMM5 .inp files",\n  directory,\n  false,\n  include_subdirs\n)' } },
        
        { id: 'size_check', type: 'decision', label: 'Size > 100MB?', description: 'Calculate total file size and warn if large batch', script: 'ui', position: { x: 100, y: 560 }, metadata: { methodName: 'check_file_sizes', codeSnippet: 'total_size = files.sum { |f| File.size(f) }\nif total_size > 100_000_000\n  warn("Large batch detected: #{total_size / 1_000_000}MB")\nend' } },
        
        { id: 'naming', type: 'process', label: 'Define Model Group Names', description: 'Set naming convention for imported model groups', script: 'ui', position: { x: 100, y: 710 }, metadata: { methodName: 'configure_naming', codeSnippet: 'model_group_names = files.map do |file|\n  base = File.basename(file, ".inp")\n  WSApplication.input_box("Model Group:", base)\nend' } },
        
        { id: 'config_file', type: 'data', label: 'import_config.yaml', description: 'Configuration file with all import settings', position: { x: 100, y: 840 }, metadata: { codeSnippet: 'config = {\n  files: file_paths,\n  model_groups: model_group_names,\n  cleanup_empty_lists: true,\n  run_validation: false\n}\nFile.write("import_config.yaml", config.to_yaml)' } },
        
        { id: 'env_var', type: 'process', label: 'Set Environment Variable', description: 'Store config file path in ICM_IMPORT_CONFIG', script: 'ui', position: { x: 100, y: 940 }, metadata: { methodName: 'set_environment', codeSnippet: 'config_path = File.absolute_path("import_config.yaml")\nENV["ICM_IMPORT_CONFIG"] = config_path\nWSApplication.set_env_var("ICM_IMPORT_CONFIG", config_path)' } },
        
        { id: 'launch_exchange', type: 'process', label: 'Launch ICMExchange.exe', description: 'Execute Exchange script in headless mode', script: 'ui', position: { x: 100, y: 1070 }, metadata: { methodName: 'launch_exchange_script', codeSnippet: 'exchange_path = "C:/Program Files/Innovyze/ICMExchange.exe"\nscript_path = File.join(script_folder, "SWMM5_Import_Exchange.rb")\nsystem("#{exchange_path} -r #{script_path}")' } },
        
        { id: 'retrieve_config', type: 'process', label: 'Retrieve Configuration', description: 'Read config from ENV variable or search filesystem', script: 'exchange', position: { x: 500, y: 50 }, metadata: { methodName: 'load_config', codeSnippet: 'config_path = ENV["ICM_IMPORT_CONFIG"] ||\n  Dir.glob("**/import_config.yaml").first\nconfig = YAML.load_file(config_path)\nfiles = config[:files]' } },
        
        { id: 'connect_db', type: 'process', label: 'Connect to Database', description: 'Open ICM database using WSApplication', script: 'exchange', position: { x: 500, y: 180 }, metadata: { methodName: 'open_network', codeSnippet: 'net = WSApplication.current_network\nif net.nil?\n  raise "No network open in ICM"\nend\ndb = net.odic_database' } },
        
        { id: 'start_log', type: 'process', label: 'Start Log File', description: 'Create timestamped log file in ICM Import Log Files folder', script: 'exchange', position: { x: 500, y: 310 }, metadata: { methodName: 'initialize_log', codeSnippet: 'timestamp = Time.now.strftime("%Y%m%d_%H%M%S")\nlog_file = "ICM_Import_#{timestamp}.log"\nlog_path = File.join(log_folder, log_file)\n@log = File.open(log_path, "w")' } },
        
        { id: 'loop_start', type: 'process', label: 'For Each File in Batch', description: 'Main processing loop through all configured files', script: 'exchange', position: { x: 500, y: 440 }, metadata: { methodName: 'process_batch', codeSnippet: 'files.each_with_index do |file_path, index|\n  log("Processing #{index + 1} of #{files.size}: #{file_path}")\n  process_single_file(file_path)\nend' } },
        
        { id: 'file_exists', type: 'decision', label: 'File Exists?', description: 'Check if .inp file is accessible', script: 'exchange', position: { x: 500, y: 570 }, metadata: { codeSnippet: 'unless File.exist?(file_path)\n  log("ERROR: File not found: #{file_path}")\n  next\nend' } },
        
        { id: 'create_model_group', type: 'process', label: 'Create Model Group', description: 'Create container in database tree', script: 'exchange', position: { x: 700, y: 690 }, metadata: { methodName: 'create_model_group', codeSnippet: 'model_group = net.new_model_object("Model Group")\nmodel_group.id = model_group_name\nmodel_group.write\nnet.current_model_object = model_group' } },
        
        { id: 'import_data', type: 'process', label: 'Import .inp File', description: 'Execute import_all_sw_model_objects()', script: 'exchange', position: { x: 700, y: 820 }, metadata: { methodName: 'import_swmm_file', codeSnippet: 'importer = WSModelObject.new\nimporter.selected = true\nobjects = importer.import_all_sw_model_objects(\n  file_path,\n  false  # don\'t delete existing\n)' } },
        
        { id: 'gather_stats', type: 'process', label: 'Gather Statistics', description: 'Count nodes, links, subcatchments', script: 'exchange', position: { x: 700, y: 950 }, metadata: { methodName: 'collect_statistics', codeSnippet: 'stats = {\n  nodes: net.row_object_collection("_nodes").count,\n  links: net.row_object_collection("_links").count,\n  subcatchments: net.row_object_collection("sw_subcatchment").count\n}\nlog("Imported: #{stats[:nodes]} nodes, #{stats[:links]} links")' } },
        
        { id: 'cleanup', type: 'decision', label: 'Cleanup Empty Label Lists?', description: 'Remove empty label lists if configured', script: 'exchange', position: { x: 700, y: 1080 }, metadata: { methodName: 'cleanup_label_lists', codeSnippet: 'if config[:cleanup_empty_lists]\n  net.label_lists.each do |list|\n    if list.labels.empty?\n      list.delete\n      log("Deleted empty label list: #{list.id}")\n    end\n  end\nend' } },
        
        { id: 'validate', type: 'decision', label: 'Run Validation?', description: 'Optional validation checks on imported network', script: 'exchange', position: { x: 700, y: 1210 }, metadata: { codeSnippet: 'if config[:run_validation]\n  validator = net.validate_all\n  errors = validator.errors\n  log("Validation: #{errors.count} errors")\nend' } },
        
        { id: 'error_handler', type: 'process', label: 'Error Handler (Rescue)', description: 'Log error, cleanup partial imports, continue to next file', script: 'exchange', position: { x: 300, y: 690 }, status: 'warning', metadata: { codeSnippet: 'rescue StandardError => e\n  log("ERROR: #{e.message}")\n  log(e.backtrace.join("\\n"))\n  failed_files << { file: file_path, error: e.message }\n  next  # Continue with next file\nend' } },
        
        { id: 'loop_end', type: 'process', label: 'Next File', description: 'Continue to next file in batch', script: 'exchange', position: { x: 500, y: 1340 } },
        
        { id: 'summary', type: 'process', label: 'Write Summary File', description: 'Create batch_summary.txt with final statistics', script: 'exchange', position: { x: 500, y: 1470 }, metadata: { methodName: 'write_summary', codeSnippet: 'summary = "Batch Import Summary\\n"\nsummary += "Files Processed: #{files.size}\\n"\nsummary += "Successful: #{success_count}\\n"\nsummary += "Failed: #{failed_files.size}\\n"\nFile.write("batch_summary.txt", summary)' } },
        
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
