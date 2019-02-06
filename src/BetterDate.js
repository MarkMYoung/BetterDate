//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
/**
 * @description A 'BetterDate' is essentially a 'Date' that is easier and more 
 *	intuitive to use than the built-in 'Date' class.
 * @version v0.0.4 (2019-02-05)
 *	v0.0.3 (2018-08-08)
 *	v0.0.2 (2018-08-08)
 *	v0.0.1 (2017-10-20)
 * @example
 *	// 'BetterDate' as a 'Date':
 *	// The '1' is one-indexed to intuitively mean 'January', not zero-indexed to mean 'February'.
 *	let betterDate = new BetterDate( 2017, 1, 26 );
 *	new Date( betterDate );
 *	// Thu Jan 26 2017 00:00:00 GMT-0600 (Central Standard Time)
 * @example
 *	// Remove 10 hours from a 'BetterDate':
 *	let epoch_ms = betterDate.addHours( -10 );
 *	// 1485374400000
 *	betterDate.toString();
 *	// Wed Jan 25 2017 14:00:00 GMT-0600 (Central Standard Time)
 * @example
 *	// Change timezone offset:
 *	betterDate.setTimezoneOffset( 480 );
 *	betterDate.setTimezoneName( 'America/Los_Angeles' );
 *	betterDate.toString();
 *	// Wed Jan 25 2017 12:00:00 GMT-0800 (America/Los_Angeles)
 *	new Date( betterDate );
 *	// Wed Jan 25 2017 14:00:00 GMT-0600 (Central Standard Time)
 */
// TODO: have 'getHours', etc. honor timezone adjustment
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
function replace_timezone_offset( betterDate, converter_method )
{
	let adjustedDate = new Date( betterDate );
	if( betterDate.timezoneAdjustment != 0 )
	{
		let adjustment_hours = parseInt( betterDate.timezoneAdjustment / 60, 10 );
		let adjustment_minutes = betterDate.timezoneAdjustment % 60;
		adjustedDate.setUTCHours( adjustedDate.getUTCHours() - adjustment_hours );
		adjustedDate.setUTCMinutes( adjustedDate.getUTCMinutes() - adjustment_minutes );
	}
	let formatted = adjustedDate[ converter_method ]();
	if( betterDate.timezoneAdjustment != 0 )
	{
		let timezone_offset_replacer = function timezone_offset_replacer()
		{
			let argv = {'groups':[], 'matched':'', 'offset':0, 'whole':''};
			argv.groups = Array.prototype.slice.apply( arguments );
			argv.matched = argv.groups.shift();// first
			argv.whole = argv.groups.pop();// last
			argv.offset = argv.groups.pop();// second to last (penultimate)

			//console.debug( "point break" );
			let timezone_offset_minutes = betterDate.getTimezoneOffset();
			let hours = Math.abs( parseInt( timezone_offset_minutes / 60, 10 ));
			let minutes = Math.abs( timezone_offset_minutes % 60 );
			let timezone_offset_sign = ((timezone_offset_minutes > 0)?('-'):('+'));
			let replacement_2 = hours.toString().padStart( !!argv.groups[ 2 ] && argv.groups[ 2 ].length || 2, '0' );
			let replacement_4 = minutes.toString().padStart( 2, '0' );
			return([argv.groups[ 0 ], timezone_offset_sign, replacement_2, argv.groups[ 3 ], replacement_4, argv.groups[ 5 ]].join( '' ));
		};
		// From what I could find, all timezone abbreviations are 2-5 letters all uppercase;
		//	regardless, this particular abbreviation should always be 'GMT'.
		// This regular expression also allows for the (RFC2822, §3.3) standard 
		//	4-digit timezone and also allows for single-digit hours and/or 
		//	colon-delimited hours and minutes without incorrectly matching 
		//	other parts.
		formatted = formatted.replace( /([A-Z]*?)([+-])?(\d{1,2})(:)?(\d{2})( \(.*?\))$/, timezone_offset_replacer );
	}
	if( !!betterDate.timezoneName )
	{
		let timezone_name_replacer = function timezone_offset_replacer()
		{
			let argv = {'groups':[], 'matched':'', 'offset':0, 'whole':''};
			argv.groups = Array.prototype.slice.apply( arguments );
			argv.matched = argv.groups.shift();// first
			argv.whole = argv.groups.pop();// last
			argv.offset = argv.groups.pop();// second to last (penultimate)

			return([argv.groups[ 0 ], betterDate.timezoneName, argv.groups[ 2 ]].join( '' ));
		};
		formatted = formatted.replace( /(\()(.*?)(\))$/, timezone_name_replacer );
	}
	return( formatted );
}
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
class BetterDate// extends Date
{
	static get EPOCH_YEAR()
	{return((new Date( 0 )).getUTCFullYear());};
	constructor()
	{
		//console.log( "point break" );
		// Even though 'BetterDate' extends/is-a 'Date', a separate 'Date' 
		//	object had to be kept in 'encapsulated' because when calling 
		//	'getTime()' and other functions some browsers would throw a 
		//	'TypeError' with "this is not a Date object."
		let hidden =
		{
			'encapsulated':null,
			'timezoneAdjustment':0,
			'timezoneName':null,
		};
		// Doing something like `Date.constructor.prototype.apply( this, arguments );` does not work.
		let args = Array.prototype.slice.apply( arguments );
		switch( args.length )
		{
		case 0:hidden.encapsulated = new Date();break;
		case 1:hidden.encapsulated = new Date( args[ 0 ]);break;
		case 2:hidden.encapsulated = new Date( args[ 0 ], Number( args[ 1 ]) - 1 );break;
		case 3:hidden.encapsulated = new Date( args[ 0 ], Number( args[ 1 ]) - 1, args[ 2 ]);break;
		case 4:hidden.encapsulated = new Date( args[ 0 ], Number( args[ 1 ]) - 1, args[ 2 ], args[ 3 ]);break;
		case 5:hidden.encapsulated = new Date( args[ 0 ], Number( args[ 1 ]) - 1, args[ 2 ], args[ 3 ], args[ 4 ]);break;
		case 6:hidden.encapsulated = new Date( args[ 0 ], Number( args[ 1 ]) - 1, args[ 2 ], args[ 3 ], args[ 4 ], args[ 5 ]);break;
		case 7:default:hidden.encapsulated = new Date( args[ 0 ], Number( args[ 1 ]) - 1, args[ 2 ], args[ 3 ], args[ 4 ], args[ 5 ], args[ 6 ]);break;
		}
		//X // Remove the timezone offset (by adding it).
		//X // Corresponds with overridden 'getTime', 'getTimezoneOffset', and 'setTime'.
		//X hidden.encapsulated.setTime( hidden.encapsulated.getTime() + (hidden.encapsulated.getTimezoneOffset() * 60 * 1000));
		Object.defineProperties( this,
		{
			// Expose the ecapsulated 'Date' object as read-only.
			'encapsulated':
			{
				'get':function()
				{return( hidden.encapsulated );},
				'set':function( value )
				{throw( new TypeError( "'encapsulated' is read-only (to prevent assignment to 'Date' objects which are aboslute, not relative, datetimes)." ));},
			},
			// Expose the ecapsulated timezone offset (number) value as read-only.
			'timezoneAdjustment':
			{
				'get':function()
				{return( hidden.timezoneAdjustment );},
				'set':function( value )
				{throw( new TypeError( "'timezoneAdjustment' is read-only." ));},
			},
			// Expose the ecapsulated timezone name (string) value as read-only.
			'timezoneName':
			{
				'get':function()
				{return( hidden.timezoneName );},
				'set':function( value )
				{throw( new TypeError( "'timezoneName' is read-only." ));},
			},
		});
		this.getTimezoneName = function()
		{
			if( hidden.timezoneName === null )
			{
				hidden.timezoneName = this.encapsulated.toString()
					.replace( /^.*?\((.*?)\)$/, '$1' )
					.replace( /^.*?(Z)$/, '$1' )
				|| null;
			}
			return( hidden.timezoneName );
		};
		this.setTimezoneName = function( name )
		{
			if( name !== null && !(typeof( name ) === 'string' || name instanceof String))
			{throw( new TypeError( "'name' must be a string (or String) or null." ));}
			hidden.timezoneName = name;
		};
		this.setTimezoneOffset = function( minutes )
		{
			if( Number( minutes ) != parseInt( minutes, 10 ))
			{throw( new TypeError( "'value' must be an integer number (or Number)." ));}
			const minutes_in_half_a_day = 720;
			hidden.timezoneAdjustment = (minutes % minutes_in_half_a_day) - this.encapsulated.getTimezoneOffset();
		};
	}
	// The second "hyphen" is actually the "minus sign" (U+2212).
	static get dateRegExp()
	{return( /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(.*?)?$/ );}
	static isLeapYear( full_year )
	{
		let is_leap_year = ((full_year % 4 == 0) && (full_year % 100 != 0)) || (full_year % 400 == 0);
		return( is_leap_year );
	}
	/** @override */
	static now()
	{
		let epoch_ms = Date.now();
		return( epoch_ms );
	}
	/** @override */
	static parse( string )
	{
		let betterDate = new BetterDate( string );
		return( betterDate );
	}
	/** @override */
	static UTC( year, month, day, hour, minute, second, millisecond )
	{
		// 'year' and 'month' are required.
		let epoch_ms = Date.UTC( year, month - 1, day, hour, minute, second, millisecond );
		return( epoch_ms );
	}
	static initializeClass()
	{
		// Adder functions.
		[
			'Date',
			'FullYear',
			'Hours',
			'Milliseconds',
			'Minutes',
			'Month',
			'Seconds',
			'Time',
			'UTCDate',
			'UTCFullYear',
			'UTCHours',
			'UTCMilliseconds',
			'UTCMinutes',
			'UTCMonth',
			'UTCSeconds',
		]
		.forEach( function proxy_adder( adder, a )
		{
			BetterDate.prototype['add'.concat( adder )] = function( value )
			{
				if( Number( value ) != parseInt( value, 10 ))
				{throw( new TypeError( "'value' must be an integer number (or Number)." ));}
				let epoch_ms = this.encapsulated['set'.concat( adder )]( this.encapsulated['get'.concat( adder )]() + value );
				return( epoch_ms );
			};
		}, this );
		// Getter functions.
		[
			'getDate',
			'getDay',
			'getFullYear',
			'getHours',
			'getMilliseconds',
			'getMinutes',
			//'getMonth',	// Overridden elsewhere.
			'getSeconds',
			//'getTime',	// Overridden elsewhere.
			//'getTimezoneOffset',	// Overridden elsewhere.
			'getUTCDate',
			'getUTCDay',
			'getUTCFullYear',
			'getUTCHours',
			'getUTCMilliseconds',
			'getUTCMinutes',
			//'getUTCMonth',	// Overridden elsewhere.
			'getUTCSeconds',
			//X 'getYear',	// Deprecated.
		]
		.forEach( function proxy_getter( getter, g )
		{
			BetterDate.prototype[ getter ] = function()
			{
				let value = this.encapsulated[ getter ]();
				return( value );
			};
		}, this );
		// Setter functions.
		[
			'setDate',
			'setFullYear',
			'setHours',
			'setMilliseconds',
			'setMinutes',
			//'setMonth',	// Overridden elsewhere.
			'setSeconds',
			//'setTime',	// Overridden elsewhere.
			'setUTCDate',
			'setUTCFullYear',
			'setUTCHours',
			'setUTCMilliseconds',
			'setUTCMinutes',
			//'setUTCMonth',	// Overridden elsewhere.
			'setUTCSeconds',
			//X 'setYear',	// Deprecated.
		]
		.forEach( function proxy_setter( setter, s )
		{
			BetterDate.prototype[ setter ] = function( value )
			{
				let epoch_ms = this.encapsulated[ setter ]( value );
				return( epoch_ms );
			};
		}, this );
		// Converter functions.
		[
			//'toDateString',	// Overridden elsewhere.
			//'toISOString',	// Overridden elsewhere.
			'toJSON',
			'toGMTString',
			'toLocaleDateString',
			//X 'toLocaleFormat',	// Deprecated.
			'toLocaleString',
			'toLocaleTimeString',
			//'toString',	// Overridden elsewhere.
			//'toTimeString',	// Overridden elsewhere.
			'toUTCString',
			'valueOf',
		]
		.forEach( function proxy_converter( converter, c )
		{
			BetterDate.prototype[ converter ] = function()
			{
				let value = this.encapsulated[ converter ]();
				return( value );
			};
		}, this );
		// Not implemented functions.
		[
			'getYear',	// Deprecated.
			'setYear',	// Deprecated.
			'toGMTString',	// Deprecated.
			'toLocaleFormat',	// Non-standard.
			'toSource',	// Non-standard.
		]
		.forEach( function proxy_not_implemented( not_implemented, n )
		{
			BetterDate.prototype[ not_implemented ] = function()
			{throw( new ReferenceError( ''.concat( "Function not implemented: '", not_implemented, "'." )));};
		}, this );
	}
	// @see http://stackoverflow.com/a/26426761/1757334 (Joe Orost)
	getDayOfYear()
	{
		let day_counts = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
		let month_of_year = this.getUTCMonth();
		let day_of_month = this.getUTCDate();
		let day_of_year = day_counts[ month_of_year ] + day_of_month;
		if( month_of_year > 1 && BetterDate.isLeapYear( this ))
		{++day_of_year;}
		return( day_of_year );
	}
	/** @override */
	getMonth()
	{
		let month_ordinal_one_indexed = this.encapsulated.getMonth() + 1;
		return( month_ordinal_one_indexed );
	}
	/** @override */
	getTime()
	{
		let epoch_ms = this.encapsulated.getTime();
		return( epoch_ms );
	}
	/** @override */
	getTimezoneOffset()
	{
		let minutes = this.timezoneAdjustment + this.encapsulated.getTimezoneOffset();
		return( minutes );
	}
	/** @override */
	getUTCMonth()
	{
		let month_ordinal_one_indexed = this.encapsulated.getUTCMonth() + 1;
		return( month_ordinal_one_indexed );
	}
	/** @return number (float) that is the remainder of weeks in a year, when used in conjuction with the number of years in a duration.
	* let number_of_weeks = Math.ceil( timeDuration.getWeeksOfYear());
	* let number_of_days = Math.floor( timeDuration.getWeeksOfYear()) + timeDuration.getUTCDay();
	*/
	getWeeksOfYear()
	{
		// TODO: this needs to start on the first Sunday
		let yearDate = new Date( ''.concat( this.getUTCFullYear()));
		const milliseconds_in_a_week = 7 * 24 * 60 * 60 * 1000;
		let weeks = (this.getTime() - yearDate.getTime()) / milliseconds_in_a_week;
		return( weeks );
	}
	isInLeapYear()
	{
		let is_leap_year = BetterDate.isLeapYear( this.getUTCFullYear());
		return( is_leap_year );
	}
	/** @override */
	setMonth( month_ordinal_one_indexed )
	{
		let epoch_ms = this.encapsulated.setMonth( month_ordinal_one_indexed - 1 );
		return( epoch_ms );
	}
	/** @override */
	setTime( value )
	//{
	//	const milliseconds_in_a_minute = 60 * 1000;
	//	return( this.encapsulated.setTime( value + (this.getTimezoneOffset() * milliseconds_in_a_minute)));
	//}
	{
		let epoch_ms = this.encapsulated.setTime( value );
		return( epoch_ms );
	}
	/** @override */
	setUTCMonth( month_ordinal_one_indexed )
	{
		let epoch_ms = this.encapsulated.setUTCMonth( month_ordinal_one_indexed - 1 );
		return( epoch_ms );
	}
	/** @override */
	toDateString()
	{
		let as_date_string = replace_timezone_offset( this, 'toDateString' );
		return( as_date_string );
	}
	/** @override */
	toISOString()
	{
		let as_iso_string = replace_timezone_offset( this, 'toISOString' );
		return( as_iso_string );
	}
	/** @override */
	toString()
	{
		let as_string = replace_timezone_offset( this, 'toString' );
		return( as_string );
	}
	/** @override */
	toTimeString()
	{
		let as_time_string = replace_timezone_offset( this, 'toTimeString' );
		return( as_time_string );
	}
	///** @override */
	//get [Symbol.toPrimitive]( hint )
	//{
	//	return(
	//		((['default', 'string'].includes( hint ))
	//			?(this.toString())
	//			:(this.valueOf())
	//		)
	//	);
	//}
}
BetterDate.initializeClass();
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
if( typeof( module ) !== 'undefined' ){module.exports = BetterDate;}
