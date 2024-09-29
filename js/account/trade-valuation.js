var Settings;
var Utilities;

(async () => {
	Utilities = await import(chrome.runtime.getURL('resources/utils.js'));
	Utilities = Utilities.default;

    chrome.storage.sync.get(['PolyPlus_Settings'], async function(result){
        Settings = result.PolyPlus_Settings
        if (
            Settings.ValueListInfo &&
            Settings.ValueListInfo.Enabled == true &&
            Settings.ValueListInfo.TradeValuation == true
        ) {
            const ColumnLabels = [
                "name",
                "short",
                "value",
                "type",
                "trend",
                "demand",
                "tags"
            ]
            
            const TagColors = {
                "Projected": "warning",
                "Hoarded": "success",
                "Rare": "primary",
                "Freaky": "danger"
            }
            
            /*
                Table to JSON function (slightly modified for my use-case)
                https://stackoverflow.com/questions/9927126/how-to-convert-the-following-table-to-json-with-javascript#answer-60196347
            */
            const ExtractTableJSON = function(table) { 
                var data = [];
                for (var i = 1; i < table.rows.length; i++) { 
                    var tableRow = table.rows[i]; 
                    var rowData = {
                        tags: []
                    }; 
                    for (var j = 0; j < tableRow.cells.length; j++) { 
                        let Value = tableRow.cells[j].children[0].children[0].innerText;
                        if (ColumnLabels[j] === "name") {
                            const LinkValue = tableRow.cells[j].getElementsByTagName('a')[0]
                            if (LinkValue) {
                                rowData.id = LinkValue.href.split('https://www.google.com/url?q=')[1].split('&')[0].split('/')[4]
                            }
                        }
                        if (ColumnLabels[j] === "tags") {
                            Array.from(tableRow.cells[j].children).forEach(tag => {
                                /* 
                                    The regex for the emoji character codes replacement was made by AI, such a time saver lol
                                */
                                rowData.tags.push(tag.children[0].innerHTML.replace(/\s/g,'').replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, ''))
                            })
                        } else {
                            rowData[ColumnLabels[j]] = Value
                        }
                    } 
                    data.push(rowData); 
                } 
                return data; 
            }
            
            const ValueListDocument = new DOMParser().parseFromString(await (await fetch('https://docs.google.com/feeds/download/documents/Export?exportFormat=html&format=html&id=1W7JN74MU-9Dbd-9xNnjxE18hQVBPXWuwjK5DGSnuQR4')).text(), 'text/html')
            
            const GetTagColor = function(label) {
                if (TagColors[label] !== undefined) {
                    return TagColors[label]
                } else if (TagColors[label.substring(1)] !== undefined) {
                    return TagColors[label.substring(1)]
                } else {
                    return 'dark'
                }
            }
            
            const ValueJSON = ExtractTableJSON(ValueListDocument.getElementsByTagName('table')[0])
            
            for (let card of Array.from(document.querySelectorAll('.card:has(a[href^="/store"])'))) {
                const ItemValuations = Array.from(card.querySelectorAll('a[href^="/store"]')).map((item) => ValueJSON.filter((x) => x.id == item.getAttribute('href').split('/')[2])[0]||null).filter((x)=>x!=null&&x.tags[0]!="")
            
                if (ItemValuations.length > 0) {
                    /* this code is so bad I never want to look at it again */

                    const QuestionMarkTooltip = document.createElement('i')
                    QuestionMarkTooltip.classList = 'fa fa-question-circle'
                    QuestionMarkTooltip.setAttribute('data-bs-toggle', 'tooltip')
                    QuestionMarkTooltip.setAttribute('data-bs-html', 'true')
                    ItemValuations.map((item) => {console.log(item.tags)})
                    QuestionMarkTooltip.setAttribute('data-bs-title', ItemValuations.map((item, i) => `
                    <b style="text-align: left !important;">${item.name}</b><br>
                    ${ item.tags.map((x) => `
                    <span class="badge bg-${ GetTagColor(x) }">${x}</span>
                    `).join('')}
                    <br>
                    `).join(''))
                    card.getElementsByClassName('card-header')[0].appendChild(QuestionMarkTooltip)
                }
            }

            Utilities.InjectResource("registerTooltips")
        }
    });
})();