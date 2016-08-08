(function(){
	var shadow_nodes = document.querySelectorAll( '[data-cc]' );
	for( var i = 0, len = shadow_nodes.length; i < len; i++ ) {
		var element = shadow_nodes[i];
		var license_info = element.getAttribute('data-cc').split('/');
    var license_type = license_info[0];
    var license_ver = license_info[1];
    var a_tag = document.createElement('a')
    a_tag.setAttribute('href', 'https://creativecommons.org/licenses/' + license_type + '/' + license_ver + '/');
    a_tag.setAttribute('target', '_blank');
    var types = license_type.split('-').map(function(str) {return str.toUpperCase()});
    a_tag.innerText = 'CC ' + types.join(' ') + ' ' + license_ver
    element.appendChild(a_tag)
	}
})();
