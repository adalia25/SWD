Ext.Loader.setConfig({
	enabled: true,
	disableCaching: true
});

Ext.application({
	name: 'swd',
	appFolder: 'app',
	paths: {
		'Ext.app': '.'
	},
	
	controllers: [
		'Main'
	],

	launch: function() {
		Ext.create('Ext.container.Viewport', {
			layout: 'fit',
			items: [
				{
					xtype: 'panel',
					title: 'System Wspomagania Decyzji',
					cls: 'swd-background',
					bodyStyle: 'background-color: transparent;',
					layout: 'vbox',
					tbar: [
						{ 
							xtype: 'filebutton',
							name: 'load',
							text: 'Wczytaj plik',
						},
						{
							xtype: 'button',
							name: 'save',
							text: 'Zapisz plik',
							href: '#',
							hrefTarget: '_blank',
							disabled: true,
							listeners: {
								afterrender: function(btn) {
									btn.getEl().set({
										download: 'swd.json'
									});
								}
							}
						},
						'|',
						{
							xtype: 'button',
							name: 'calculate',
							text: 'Wylicz',
							disabled: true
						}
					]
				}
			]
		});
	}
});
