(function(a){var b={init:function(c){var d=a.extend({items:1,itemsOnPage:1,pages:0,displayedPages:5,edges:2,currentPage:1,hrefTextPrefix:"#page-",hrefTextSuffix:"",prevText:"Prev",nextText:"Next",ellipseText:"&hellip;",cssStyle:"light-theme",selectOnClick:!0,onPageClick:function(){},onInit:function(){}},c||{}),e=this;return d.pages=d.pages?d.pages:Math.ceil(d.items/d.itemsOnPage)?Math.ceil(d.items/d.itemsOnPage):1,d.currentPage=d.currentPage-1,d.halfDisplayed=d.displayedPages/2,this.each(function(){e.addClass(d.cssStyle).data("pagination",d),b._draw.call(e)}),d.onInit(),this},selectPage:function(a){return b._selectPage.call(this,a-1),this},prevPage:function(){var a=this.data("pagination");return a.currentPage>0&&b._selectPage.call(this,a.currentPage-1),this},nextPage:function(){var a=this.data("pagination");return a.currentPage<a.pages-1&&b._selectPage.call(this,a.currentPage+1),this},destroy:function(){return this.empty(),this},redraw:function(){return b._draw.call(this),this},disable:function(){var a=this.data("pagination");return a.disabled=!0,this.data("pagination",a),b._draw.call(this),this},enable:function(){var a=this.data("pagination");return a.disabled=!1,this.data("pagination",a),b._draw.call(this),this},_draw:function(){var e,a=this,c=a.data("pagination"),d=b._getInterval(c);if(b.destroy.call(this),c.prevText&&b._appendItem.call(this,c.currentPage-1,{text:c.prevText,classes:"prev"}),d.start>0&&c.edges>0){var f=Math.min(c.edges,d.start);for(e=0;f>e;e++)b._appendItem.call(this,e);c.edges<d.start&&1!=d.start-c.edges?a.append('<span class="ellipse">'+c.ellipseText+"</span>"):1==d.start-c.edges&&b._appendItem.call(this,c.edges)}for(e=d.start;d.end>e;e++)b._appendItem.call(this,e);if(d.end<c.pages&&c.edges>0){c.pages-c.edges>d.end&&1!=c.pages-c.edges-d.end?a.append('<span class="ellipse">'+c.ellipseText+"</span>"):1==c.pages-c.edges-d.end&&b._appendItem.call(this,d.end++);var g=Math.max(c.pages-c.edges,d.end);for(e=g;c.pages>e;e++)b._appendItem.call(this,e)}c.nextText&&b._appendItem.call(this,c.currentPage+1,{text:c.nextText,classes:"next"})},_getInterval:function(a){return{start:Math.ceil(a.currentPage>a.halfDisplayed?Math.max(Math.min(a.currentPage-a.halfDisplayed,a.pages-a.displayedPages),0):0),end:Math.ceil(a.currentPage>a.halfDisplayed?Math.min(a.currentPage+a.halfDisplayed,a.pages):Math.min(a.displayedPages,a.pages))}},_appendItem:function(c,d){var f,g,e=this,h=e.data("pagination");c=0>c?0:h.pages>c?c:h.pages-1,f=a.extend({text:c+1,classes:""},d||{}),c==h.currentPage||h.disabled?g=a('<span class="current">'+f.text+"</span>"):(g=a('<a href="'+h.hrefTextPrefix+(c+1)+h.hrefTextSuffix+'" class="page-link">'+f.text+"</a>"),g.click(function(){return b._selectPage.call(e,c)})),f.classes&&g.addClass(f.classes),e.append(g)},_selectPage:function(a){var c=this.data("pagination");return c.currentPage=a,c.selectOnClick&&b._draw.call(this),c.onPageClick(a+1)}};a.fn.pagination=function(c){return b[c]&&"_"!=c.charAt(0)?b[c].apply(this,Array.prototype.slice.call(arguments,1)):"object"!=typeof c&&c?(a.error("Method "+c+" does not exist on jQuery.pagination"),void 0):b.init.apply(this,arguments)}})(jQuery);