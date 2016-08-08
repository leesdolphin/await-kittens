
(function(){
	var shadow_nodes = document.querySelectorAll( '[data-dropshadow]' );
	for( var i = 0, len = shadow_nodes.length; i < len; i++ ) {
		var element = shadow_nodes[i];
		var shadow = element.getAttribute('data-dropshadow') || '';
		var shadow_width = '3px';
		var shadow_height = '3px';
		var shadow_radius = '5px';
		var shadow_colour = 'rgba(220, 220, 220, 0.4)';
		try {
			var shadow_parts = JSON.parse(shadow)
			shadow_width = shadow_parts.w || shadow_parts.width || shadow_width
			shadow_height = shadow_parts.h || shadow_parts.height || shadow_height
			shadow_radius = shadow_parts.r || shadow_parts.radius || shadow_radius
			shadow_colour = shadow_parts.c || shadow_parts.colour || shadow_parts.color || shadow_colour
		} catch (e) {
			// noop
		}
		ne_shadow = ['-' + shadow_width, '-' + shadow_height, shadow_radius, shadow_colour].join(' ')
		nw_shadow = [shadow_width, '-' + shadow_height, shadow_radius, shadow_colour].join(' ')
		se_shadow = ['-' + shadow_width, shadow_height, shadow_radius, shadow_colour].join(' ')
		sw_shadow = [shadow_width, shadow_height, shadow_radius, shadow_colour].join(' ')
		element.style.textShadow = [ne_shadow, nw_shadow, se_shadow, sw_shadow].join(',')
	}
})();
