//
// cocoatable.js
// Copyright(c) 2010 ku ku0522a*gmail.com
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

function $A(a) {
	return Array.prototype.slice.call(a)
}
function $T(e) {
	return (typeof e.innerText == 'undefined') ?
		e.textContent : e.innerText;
}
function setText(e, text) {
	if (typeof e.innerText == 'undefined') {
		e.appendChild(document.createTextNode(text));
	} else {
		e.innerText = text;
	}
}
function keys(o) {
	if (Object.keys) {
		return Object.keys(o)
	} else {
		var klasses = [];
		for (var n in o) {
			klasses.push(n);
		}
		return klasses;
	}
}
function _classHash(e) {
	var o = e.className.split(/\s+/).reduce(function (m, n) {
		m[n] = 1;
		return m;
	}, {});
	var klasses = [];
	for (var n in o) {
		klasses.push(n);
	}
	return o;
}
function removeClass(e, name) {
	var o = _classHash(e);
	delete o[name];
	e.className = keys(o).join(" ");
}
function addClass(e, name) {
	var o = _classHash(e);
	o[name] = 1;
	e.className = keys(o).join(" ");
}




function CocoaTable(data, headers, listener) {
	this._cellObjects = [];
	this._editingCell = null;
	this._selectedRow = null;
	this._index2name = headers;
	this._listener = listener || {};

	this._table = document.getElementById('cocoatable');
	this.initialize(data);
	this._cells = 0;


	var self = this;
	document.addEventListener('click', function (e) {
		if (self._editingCell) {
			self._editingCell.commit();
			self._editingCell = null;
		}
	}, false);

	this.setupButtonEventHandlers();
}

CocoaTable.Cell = function (opts) {
	this.id = opts.id;
	this._e = document.createElement('td');
	this._editbox = null;
	this._listener = opts.listener;
	this._textContainer = document.createElement('span');
	this._modelValue = opts.text
	setText(this._textContainer, opts.text);
	this._e.appendChild(this._textContainer);

	if (opts.editing) {
		this.open();
	}

	var self = this;
	this._e.addEventListener('click', function (ev) {
		try {
			self.open();
			ev.preventDefault();
			ev.stopPropagation();
		} catch (e) { console.log(e) }
	}, false);
}
CocoaTable.prototype.formats = function () {
	var self = this;
	var rows = document.querySelectorAll('.cocoatable tbody tr');
	var a = $A(rows).map(function (row) {
		var columns = row.querySelectorAll('td');
		return $A(columns).reduce(function (j, i, index) {
			var t = $T(i);
			j[self._index2name[index]] = t;
			return j;
		}, {});
	});
	return a;
}
CocoaTable.prototype.chooseUniqueId = function () {
	var rows = document.querySelectorAll('.cocoatable tbody tr');
	var max = Array.prototype.slice.call(rows).reduce(function (m, row) {
		var n = row.getAttribute('id');
		n = n.replace(/^\D+(\d+)$/, '$1');
		return (m < n) ? n : m;
	}, -1);
	return max + 1;
}
CocoaTable.prototype.moveToNextCell = function (cellColumnElement) {
	var target = cellColumnElement.nextSibling;
	var nextCell = this.findCellObjectForElmenet(target);
	if (nextCell) {
		nextCell.open();
	}
}
CocoaTable.prototype.onSelectedRowChanged = function (callback) {
	// FUTURE add cleanup of previous listener
	return this._table.addEventListener('selectedRowChanged', callback);
}
CocoaTable.prototype.setSelectedRow = function (row) {
	var prevRow = this._selectedRow;
	if (this._selectedRow) {
		removeClass(this._selectedRow, 'selected');
	}
	if (row) {
		addClass(row, 'selected');
	}
	this._selectedRow = row;
	if (this._listener.onSelectedRowChanged) {
		this._listener.onSelectedRowChanged.call(this._listener, {
			'detail': {
				'previous': prevRow,
				'current': this._selectedRow
			}
		});
	}
}
CocoaTable.prototype.emptyRowObjectRepresentation = function () {
	return this._index2name.reduce(function (j, i) {
		j[i] = '';
		return j;
	}, {});
}
CocoaTable.prototype.setupButtonEventHandlers = function () {
	var plus = document.getElementById('cocoatable-button-plus');
	var minus = document.getElementById('cocoatable-button-minus');

	var self = this;
	plus.addEventListener('click', function (ev) {
		try {
			if (self._editingCell) {
				self._editingCell.commit();
				self._editingCell = null;

			}

			var row = self.addRow(self.emptyRowObjectRepresentation(),
				self.chooseUniqueId(), true);
			self.setSelectedRow(row);

			ev.preventDefault();
			ev.stopPropagation();
		} catch (e) {
			console.log(e)
		}
	}, true);
	minus.addEventListener('click', function (ev) {
		if (self._selectedRow == null) {
			return;
		}

		self.emit('removing', self.elementIndex(self._selectedRow), self._selectedRow);
		self.removeRow(self._selectedRow);
		self.setSelectedRow(null);
		self.emit('updated');
		ev.preventDefault();
		ev.stopPropagation();
	}, true);
}

CocoaTable.prototype.elementIndex = function (e) {
	var children = e.parentNode.querySelectorAll(e.tagName);
	for (var i = 0; i < children.length; i++) {
		if (children[i] == e) {
			return i;
		}
	}
	return -1;
}

CocoaTable.prototype.removeRow = function (row) {
	row.parentNode.removeChild(row);
}

CocoaTable.Cell.prototype.element = function () {
	return this._e;
}
CocoaTable.Cell.prototype.open = function () {
	if (this._editbox == null) {
		var self = this;

		this._editbox = document.createElement('input');
		this._editbox.type = 'text';
		this._editbox.width = this._e.offsetWidth - 20;
		this._editbox.style.width = (this._e.offsetWidth - 20) + "px";
		this._editbox.value = $T(this._textContainer);
		this._editbox.addEventListener('keydown', function (ev) {
			if (ev.keyCode == 9) {
				self.commit();
				if (self._listener) {
					self._listener.moveToNextCell(self._e);
				}
			} else if (ev.keyCode == 13) {
				self.commit();
			} else if (ev.keyCode == 27) {
				self.cancel();
			}
		}, false);
		this._e.appendChild(this._editbox);
		addClass(this._e, 'editing');
		//addClass( this._e.parentNode, 'editing');
		this._textContainer.style.display = 'none';

		window.setTimeout(function () {
			self._editbox.focus();
			self._editbox.select();
		}, 10);

		if (this._listener) {
			this._listener.startEditing(self);
		}
	}
}
CocoaTable.Cell.prototype.value = function () {
	return this._editbox ? this._editbox.value : $T(this._textContainer);
}
CocoaTable.Cell.prototype.close = function () {
	this._editbox.parentNode.removeChild(this._editbox);
	this._textContainer.style.display = "";
	this._editbox = null;

	removeClass(this._e, 'editing');
	//removeClass( this._e.parentNode, 'editing');

	if (this._listener) {
		this._listener.endEditing(this);
	}

	this.removeEmptyRow();
}
CocoaTable.Cell.prototype.removeEmptyRow = function () {
	var empty = this.siblingCells.every(function (n) {
		return (n.value() == '');
	});
	if (empty) {
		var row = this._e.parentNode;
		row.parentNode.removeChild(row);
		return true;
	}
	return false
}

CocoaTable.Cell.prototype.cancel = function () {
	if (this._editbox) {
		this._editbox.value = '';
	}

	this.close();

	if (this._listener)
		this._listener.unselectRow();
}
CocoaTable.Cell.prototype.commit = function () {
	oldValue = this._modelValue;
	this._modelValue = this._editbox.value;
	setText(this._textContainer, this._editbox.value);

	this.close();

	if (this._listener) {
		this._listener.unselectRow();
		this._listener.emit('updated', this._modelValue, oldValue);
	}
}
CocoaTable.prototype.findCellObjectForElmenet = function (e) {
	return this._cellObjects.reduce(function (j, i) {
		return j ? j : ((i.boundElement == e) ? i.cellObject : null);
	}, null);
}
CocoaTable.prototype.addRow = function (def, suffixId, editing) {
	var tbody = this._table.querySelector('tbody');
	var row = document.createElement('tr');

	var self = this;
	var siblings = this._index2name.map(function (columnName, index) {

		if (index > 0)
			editing = false;

		var cell = new CocoaTable.Cell({
			id: "cocoatable-cell-" + columnName + "-" + suffixId,
			text: def[columnName] || '',
			editing: editing,
			listener: self
		});
		row.appendChild(cell.element());
		self._cellObjects.push({
			cellObject: cell,
			boundElement: cell._e
		});
		return cell;
	});

	siblings.map(function (i) {
		i.siblingCells = siblings;
	});

	var self = this;
	row.addEventListener('click', function (ev) {
		if (self._selectedRow != row) {
			if (self._editingCell) {
				self._editingCell.commit();
				self._editingCell = null;

			}

			self.setSelectedRow(row);
			ev.preventDefault();
			ev.stopPropagation();
		} else {

		}
	}, true);
	row.setAttribute('id', 'cocoatable-row' + suffixId);

	tbody.appendChild(row);
	return row;
}

CocoaTable.prototype.initialize = function (formats) {
	var self = this;
	formats.map(function (n, i) {
		self.addRow.apply(self, [n, i], false);
	});
}
CocoaTable.prototype.unselectRow = function () {
	this.setSelectedRow(null);
}
CocoaTable.prototype.endEditing = function (cell) {
	this._editingCell = null;
}
CocoaTable.prototype.startEditing = function (cell) {
	if (this._editingCell) {
		this._editingCell.commit();
	}
	this._editingCell = cell;
}
CocoaTable.prototype.emit = function (eventName) {
	var name = 'on' + eventName.substring(0, 1).toUpperCase() + eventName.substring(1);
	var f = this._listener[name];
	if (f) {
		return f.apply(this._listener, Array.prototype.slice.call(arguments).slice(1));
	}
}
