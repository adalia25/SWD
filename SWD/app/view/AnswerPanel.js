Ext.define('swd.view.AnswerPanel', {
	extend: 'swd.view.RatingPanel',
	
	getStoreConfig: function(vector) {
		var config = this.callParent([vector]);
		
		// Sortujemy dane malejaco
		Ext.Array.sort(config.data, function(a, b) {
			return b[1]-a[1];
		});
		
		// Zostawiamy tylko pierwszy rekord
		config.data = [config.data[0]];
		
		return config;
	},
	
	getColumnsConfig: function() {
		var config = this.callParent();
		// Usuwamy pierwsza kolumne czyli rownumberer
		config.splice(0, 1);
		return config;
	}
	
});