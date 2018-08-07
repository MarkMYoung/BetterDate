# BetterDate
`BetterDate` is a JavaScript class just like the built-in `Date`, except:
* Numeric month values are one-indexed like year and date (there is no year, month, or day zero), instead of zero-indexed.
* Values can be modified with relative values using `add*` functions, instead of being absolute requiring both a `set*` and `get*` to be called to modify by a delta.
* The time zone offset is modifiable, instead of being unmodifiable without modifying the interpretor's environment.
* The time zone name is accessible as a separate property and is modifiable, instead of being, inaccessible and unmodifiable without modifying the interpretor's environment.
* Week of the year information is accessible (as a fractional week, `Math.floor` the result for whole weeks or `Math.ceil` the result for ordinal/partial weeks).
* Leap year information is available on instances for the year represented and on the class for any year in question.
* Day of the week is still zero-indexed.
```JavaScript
let betterDate = new BetterDate();
```
The '1' is one-indexed to intuitively mean 'January', not zero-indexed to mean 'February'.
```JavaScript
betterDate = new BetterDate( 2017, 1, 26 );
new Date( betterDate );
// Thu Jan 26 2017 00:00:00 GMT-0600 (Central Standard Time)
```
Remove 10 hours from a 'BetterDate':
```JavaScript
let epoch_ms = betterDate.addHours( -10 );
// 1485374400000
betterDate.toString();
// Wed Jan 25 2017 14:00:00 GMT-0600 (Central Standard Time)
```
Change the time zone offset (and name) without affecting the represented time.
```JavaScript
betterDate.setTimezoneOffset( 480 );
betterDate.setTimezoneName( 'America/Los_Angeles' );
betterDate.toString();
// Wed Jan 25 2017 12:00:00 GMT-0800 (America/Los_Angeles)
new Date( betterDate );
// Wed Jan 25 2017 14:00:00 GMT-0600 (Central Standard Time)
```
Get week of year.
```JavaScript
Math.ceil( betterDate.getWeeksOfYear());
// 4
```
