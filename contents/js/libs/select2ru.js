(function(a){"use strict";a.extend(a.fn.select2.defaults,{formatNoMatches:function(){return"\u0421\u043e\u0432\u043f\u0430\u0434\u0435\u043d\u0438\u0439 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e"},formatInputTooShort:function(a,b){var c=b-a.length;return"\u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u0435\u0449\u0435 "+c+" \u0441\u0438\u043c\u0432\u043e\u043b"+(1==c?"":c>1&&5>c?"\u0430":"\u043e\u0432")},formatInputTooLong:function(a,b){var c=a.length-b;return"\u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043d\u0430 "+c+" \u0441\u0438\u043c\u0432\u043e\u043b"+(1==c?"":c>1&&5>c?"\u0430":"\u043e\u0432")+" \u043c\u0435\u043d\u044c\u0448\u0435"},formatSelectionTooBig:function(a){return"\u0412\u044b \u043c\u043e\u0436\u0435\u0442\u0435 \u0432\u044b\u0431\u0440\u0430\u0442\u044c \u043d\u0435 \u0431\u043e\u043b\u0435\u0435 "+a+" \u044d\u043b\u0435\u043c\u0435\u043d\u0442"+(1==a?"\u0430":"\u043e\u0432")},formatLoadMore:function(){return"\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0434\u0430\u043d\u043d\u044b\u0445..."},formatSearching:function(){return"\u041f\u043e\u0438\u0441\u043a..."}})})(jQuery);