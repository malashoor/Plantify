export default {
  // ... existing translations
  
  // Sensor rule translations
  sensorRule: {
    above: 'above',
    below: 'below',
  },
  
  // Sensor rule alert templates
  sensorRuleAlert: {
    title: '{{parameter}} alert for {{plantName}}',
    body: 'Your {{parameter}} has been {{condition}} {{threshold}}{{unit}} for {{duration}} minutes.',
    viewDetails: 'View details',
  },
  
  // Sensor rules translations
  sensorRules: {
    title: 'Sensor Rules',
    addNew: 'Add Rule',
    addHint: 'Create a new sensor rule',
    editRule: 'Edit Rule',
    newRule: 'New Rule',
    deleteConfirm: 'Are you sure you want to delete this rule for {parameter}?',
    deleteError: 'Failed to delete sensor rule',
    loadError: 'Failed to load sensor rules',
    createError: 'Failed to create sensor rule',
    updateError: 'Failed to update sensor rule',
    noRules: 'No sensor rules created yet',
    tapAdd: 'Tap the Add button to create your first rule',
    plant: 'Plant',
    allPlants: 'All Plants',
    parameter: 'Parameter',
    condition: 'Condition',
    threshold: 'Threshold',
    thresholdHint: 'Enter the value that will trigger the rule',
    thresholdRequired: 'Threshold value is required',
    duration: 'Duration',
    durationHint: 'How long the condition must be true before triggering',
    durationRequired: 'Duration is required',
    actions: 'Actions',
    notification: 'Push Notification',
    notificationDesc: 'Send a notification to this device',
    sms: 'SMS Alert',
    smsDesc: 'Send a text message alert',
    slack: 'Slack Alert',
    slackDesc: 'Post alert to Slack channel',
    slackChannel: 'Slack Channel',
    slackChannelRequired: 'Slack channel is required',
    slackMention: 'Mention User ID (Optional)',
    slackMentionHint: 'User ID to mention in the Slack alert',
    editHint: 'Edit this sensor rule',
    deleteHint: 'Delete this sensor rule',
  },
  
  // Update common translations
  common: {
    // ... existing common translations
    minutes: 'minutes',
    error: 'Error',
    cancel: 'Cancel',
    create: 'Create',
    update: 'Update',
    delete: 'Delete',
    confirm: 'Confirm',
    edit: 'Edit',
    close: 'Close',
  },
  
  // Update tabs translations
  tabs: {
    // ... existing tabs translations
    sensorRules: 'Rules',
  },
  
  // Update accessibility translations
  accessibility: {
    // ... existing accessibility translations
    sensorRulesTab: 'View sensor rules',
  },
  
  // ... continue with existing translations
}; 