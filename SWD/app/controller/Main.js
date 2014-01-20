Ext.define('swd.controller.Main', {
	extend: 'Ext.app.Controller',
	requires: [
		'swd.util.Matrix',
		'swd.util.AHP'
	],
	
	views: [
		'MatrixPanel',
		'RatingPanel',
		'ChartPanel',
		'AnswerPanel'
	],
	
	refs: [
		{ ref: 'SaveBtn', selector: 'viewport > panel button[name=save]' },
		{ ref: 'CalculateBtn', selector: 'viewport > panel button[name=calculate]' }
	],
	
	
	init: function() {
		var me = this;
		
		me.control({
			'viewport > panel': {
				afterrender: me.onCreateMainView
			},
			'viewport > panel button[name=load]': {
				change: me.onChangeFile
			},
			'viewport > panel button[name=calculate]': {
				click: me.onClickCalculate
			}
		});
		
	},
	
	getMainView: function() {
		return Ext.ComponentQuery.query('viewport > panel')[0];
	},
	
	onCreateMainView: function(view) {
		var me = this;
		me.mon(view, {
			add: me.onAddComponentToMainView,
			remove: me.onRemoveComponentFromMainView,
			scope: me
		});
	},
	
	onAddComponentToMainView: function(view, component) {
		var me = this;
		if (component instanceof me.getView('MatrixPanel')) {
			component.on('matrixchange', me.onMatrixChange, me);
		}
	},
	
	onRemoveComponentFromMainView: function(view, component) {
		var me = this;
		if (component instanceof me.getView('MatrixPanel')) {
			component.un('matrixchange', me.onMatrixChange, me);
		}
	},
	
	onMatrixChange: function() {
		var me = this,
				panel = me.getMainView(),
				views = panel.query('matrixpanel'),
				btn = me.getCalculateBtn(),
				coherentCnt = 0;
				
			// Liczymy spojne macierze
			Ext.Array.forEach(views, function(matrixPanel) {
				if (matrixPanel.isCoherent) {
					coherentCnt++;
				}
			});
			
			// Wylaczamy przycisk "Wylicz" w przypadku gdy przynajmniej jedna
			// macierz jest niespojna
			btn.setDisabled(coherentCnt !== views.length);
	},
	
	onChangeFile: function(btn, ev) {
		var me = this,
			reader = new FileReader(),
			file = ev.target.files[0],
			data;
	
		reader.onload = function(ev) {
			try {
				data = Ext.JSON.decode(ev.target.result);
				me.loadData(data);
				with (me.getSaveBtn()) {
					setHref('data:application/json;charset=utf-8,'+encodeURIComponent(data));
					setDisabled(false);
				}
			} catch (e) {
				Ext.Msg.show({
					title: 'Błąd',
					msg: 'Niepoprawny format pliku JSON.',
					buttons: Ext.Msg.OK,
					icon: Ext.Msg.ERROR
				});
			} finally {
				btn.reset();	// Trzeba go zresetowac zeby mozna bylo wybrac ten sam plik ponownie
			}
		};
		
		reader.readAsText(file);
	},
	
	onClickCalculate: function() {
		var me = this,
				panel = me.getMainView(),
				vectors = [];
				
		try {
			
			// Wylaczamy odswierzanie strony
			Ext.suspendLayouts();
			
			// Usuwamy poprzednie widoki resultatow
			me.clearResult();
			
			// Sprawdzamy czy wszystkie macierze sa spojne, jezeli nie
			// to generujemy wyjatek
			// Dodatkowo wypelniamy tablice wektorow
			Ext.Array.forEach(panel.query('matrixpanel'), function(matrixPanel) {
				if (!matrixPanel.isCoherent) {
					Ext.Error.raise('Przynajmniej jedna macierz jest niespójna.');
				}
				vectors.push(matrixPanel.getPrefVector());
			});
			
			// Generujemy widoki dla wynikow obliczen
			me.createResult(vectors);
			
		} catch (e) {
			Ext.Msg.show({
				title: 'Błąd',
				msg: e.message,
				buttons: Ext.Msg.OK,
				icon: Ext.Msg.ERROR
			});
		} finally {
			// Odswierzamy strone
			Ext.resumeLayouts(true);
		}
		
	},
	
	clearData: function() {
		var panel = this.getMainView();
		panel.removeAll();
	},
	
	loadData: function(data) {
		var me = this,
				panel = me.getMainView(),
				vectors = [],			// Tablica wektorow
				coherentCnt = 0,	// Licznik spojnych macierzy
				view,
				container;
		
		// Przechowujemy sobie wczytane dane
		me.data = data;
		
		try {
			
			// Wylaczamy odswierzanie strony
			Ext.suspendLayouts();
			
			// Usuwamy wszystkie poprzedio wygenerowane widoki
			me.clearData();
			
			// Tworzymy widok dla macierzy preferencji
			view = me.getView('MatrixPanel').create({
				title: data.criteria.title,
				width: 250,
				height: 160,
				margin: 5,
				matrix: me.createMatrix(data.criteria.items)
			});
			// Dodajemy go do widoku glownego
			panel.add(view);
			// Zapisujemy sobie wektor
			vectors[0] = view.getPrefVector();
			// Jezeli macierz spojna to zwiekszamy
			coherentCnt += view.isMatrixCoherent() ? 1 : 0;
			
			// Tworzymy kontener na widoki porownan
			container = Ext.create('Ext.container.Container', {
				layout: 'hbox',
				bubbleEvents: ['add', 'remove']
			});
			// Dodajemy go do widoku glownego
			panel.add(container);
			
			Ext.Array.forEach(data.comparison, function(comp, i) {
				// Tworzymy widok dla macierzy kryteriow
				view = me.getView('MatrixPanel').create({
					title: comp.title,
					width: 250,
					height: 160,
					margin: 5,
					matrix: me.createMatrix(comp.items)
				});
				// Dodajemy go do kontenera
				container.add(view);
				vectors[i+1] = view.getPrefVector();
				// Jezeli macierz spojna to zwiekszamy
				coherentCnt += view.isMatrixCoherent() ? 1 : 0;
			});
			
			if (coherentCnt !== vectors.length) {
				Ext.Error.raise("Przynajmniej jedna macierz jest niespójna.");
			}
			
			// Generujemy widoki dla wynikow obliczen
			me.createResult(vectors);
			
		} catch (e) {
			Ext.Msg.show({
				title: 'Błąd',
				msg: e.message,
				buttons: Ext.Msg.OK,
				icon: Ext.Msg.ERROR
			});
		} finally {
			// Odswierzamy strone
			Ext.resumeLayouts(true);
		}
	},
	
	createMatrix: function(items) {
		return new swd.util.Matrix({
			items: items
		});
	},
	
	createAHP: function(items) {
		return new swd.util.AHP({
			vectors: items
		});
	},
	
	clearResult: function() {
		var me = this,
				panel = me.getMainView(),
				container = panel.query('container[name=results]');
		if (!Ext.isEmpty(container)) {
			panel.remove(container);
		}
	},
	
	createResult: function(vectors) {
		var me = this,
				data = me.data,
				panel = me.getMainView(),
				view,
				container,
				ahp;
		
		// Tworzymy obiekt AHP, wykorzystamy go w dwoch widokach
		ahp = me.createAHP(vectors);
		
		// Tworzymy kontener na widok rankingu
		container = Ext.create('Ext.container.Container', {
			layout: 'hbox',
			name: 'results'
		});
		// Dodajemy go do widoku glownego
		panel.insert(2, container);
		
		// Tworzymy widok dla wektora rankingu
		view = me.getView('RatingPanel').create({
			title: 'Ranking',
			width: 250,
			height: 250,
			margin: 5,
			decision: data.decision,
			ahp: ahp
		});
		// Dodajemy go do kontenera
		container.add(view);
		
		// Tworzymy widok dla wykresu rankingu
		view = me.getView('ChartPanel').create({
			title: 'Wykres',
			width: 250,
			height: 250,
			margin: 5,
			decision: data.decision,
			ahp: ahp
		});
		// Dodajemy go do kontenera
		container.add(view);

		// Tworzymy widok dla odpowiedzi
		view = me.getView('AnswerPanel').create({
			title: 'Odpowiedz',
			width: 250,
			height: 250,
			margin: 5,
			decision: data.decision,
			ahp: ahp
		});
		// Dodajemy go do kontenera
		container.add(view);
	}
	
});