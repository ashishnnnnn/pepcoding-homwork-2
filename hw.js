let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595"
let fs = require("fs")
let path = require("path")

function create_folder(names){
    for(let i=0;i<names.length;i++){
        if (!fs.existsSync(names[i])){
            fs.mkdirSync(names[i]);
        }
    }
}

let cheerio = require("cheerio");
let request = require('request');
const { html } = require("cheerio");
console.log("before");
request(url,cb)
function cb(error,response,html){
    if(error){
        console.log(error);
    }
    if(html){
        getfulllink(html)
    }
}

function process_name(name){
    let ret = ""
    let sp = name.split(" ")
    for(let i=0;i<sp.length;i++){
        let f = 0
        let ret1 = ""
        for(let j=0;j<sp[i].length;j++){
            if((sp[i][j]>='a' && sp[i][j]<='z') || (sp[i][j]>='A' && sp[i][j]<='Z')){
                ret1+=sp[i][j]
            }
            else{
                f = 1
                break
            }
        }
        //console.log(ret1)
        ret = ret + ret1
        ret = ret + " "
        if(f==1){
            break
        }
    }
    //console.log(ret)
    return ret
}

function getfulllink(html){
    let selectorTool = cheerio.load(html)
    let link = selectorTool(selectorTool(".label.blue-text.blue-on-hover")[0]).attr("href")
    let full_link = "https://www.espncricinfo.com"+link
    operate_each(full_link)
}

function operate_each(link){
    request(link,cb)
    function cb(error,response,html){
        if(error){
            console.log(error)
        }
        if(html){
            operate_each1(html)
        }
    }
}

function operate_each1(html){
    let selectorTool = cheerio.load(html)
    let all_match = selectorTool(".match-info-link-FIXTURES");
    for(let i=0;i<all_match.length;i++){
        let match_link = selectorTool(all_match[i]).attr("href")
        match_link = "https://www.espncricinfo.com"+match_link
        operate_each2(match_link)
    }
}

function operate_each2(link){
    request(link,cb)
    function cb(error,response,html){
        if(error){
            console.log(error)
        }
        if(html){
            operate_each3(html)
        }
    }
}

function operate_each3(html){
    let selectorTool = cheerio.load(html)
    let teams = selectorTool(".match-info.match-info-MATCH .name")
    let team_name = []
    for(let i=0;i<teams.length;i++){
        team_name.push(selectorTool(teams[i]).text());
    }
    create_folder(team_name)
    let discription = selectorTool(".match-info.match-info-MATCH .description").text()
    //discription = discription.split(",")
    //let order_of_match = discription[0].trim()
    //let venue = discription[1].trim()
    //let date = discription[2].trim()
    let batsman_table_all = selectorTool(".table.batsman")
    for(let i=0;i<batsman_table_all.length;i++){
        let batsman_single = selectorTool(batsman_table_all[i]).find("tbody tr")
        for(let j=0;j<batsman_single.length;j++){
            let column = selectorTool(batsman_single[j]).find("td")
            if(column.length>5){
                //let name = selectorTool(column[0]).text()
                //let processed_name = process_name(name)
                //processed_name = processed_name.trim()
                kind = "batsman"
                create_file_for_batsman(column,discription,team_name[i],kind)
            } 
        }
    }
    let boller_table_all = selectorTool(".table.bowler")
    for(let i=0;i<boller_table_all.length;i++){
        let boller_single = selectorTool(boller_table_all[i]).find("tbody tr")
        for(let j=0;j<boller_single.length;j++){
            let column = selectorTool(boller_single[j]).find("td")
            if(column.length>5){
                let name = selectorTool(column[0]).text()
                let processed_name = process_name(name)
                processed_name = processed_name.trim()
                //console.log(processed_name+" -> "+team_name[1-i])
                kind = "boller"
                create_file_for_boller(column,discription,team_name[1-i],kind)
            } 
        }
    }

} 

function create_json(team_name,player_name){
    let pathoffile = path.join(__dirname,team_name,player_name+".json")
    if(fs.existsSync(pathoffile)==false){
        let create_stream = fs.createWriteStream(pathoffile)
        create_stream.end();
    }
}

function create_file_for_boller(column,discription,team_name,kind){
    let selectorTool = cheerio.load('<h2 class="title">Hello world</h2>');
    let name = selectorTool(column[0]).text()
    let processed_name = process_name(name)
    processed_name = processed_name.trim()

    discription = discription.split(",")
    let order_of_match = discription[0].trim()
    let venue = discription[1].trim()
    let date = discription[2].trim()
    let over = selectorTool(column[1]).text()
    let maiden = selectorTool(column[2]).text()
    let run_given = selectorTool(column[3]).text()
    let wicket_taken = selectorTool(column[4]).text()
    let ecconomy = selectorTool(column[5]).text()
    let dots = selectorTool(column[6]).text()
    let fours = selectorTool(column[7]).text()
    let sixes = selectorTool(column[8]).text()
    let wide = selectorTool(column[9]).text()
    let noball = selectorTool(column[10]).text()

    let obj = {}
    obj.kind = kind
    obj.name = processed_name
    obj.order_of_match = order_of_match
    obj.venue = venue
    obj.date = date
    obj.over = over
    obj.maiden = maiden
    obj.run_given = run_given
    obj.wicket_taken = wicket_taken
    obj.ecconomy = ecconomy
    obj.dots = dots
    obj.fours = fours
    obj.sixes = sixes
    obj.wide = wide
    obj.noball = noball
    let pathh = path.join(team_name+"/"+processed_name+".json")
    if(fs.existsSync(pathh)==false){
        obj = [obj]
        fs.writeFileSync(pathh, JSON.stringify(obj))
    }
    else{
        let content = fs.readFileSync(pathh,"utf-8");
        let json = JSON.parse(content);
        json.push(obj)
        fs.writeFileSync(pathh,JSON.stringify(json))
    }
}

function create_file_for_batsman(column,discription,team_name,kind){
    let selectorTool = cheerio.load('<h2 class="title">Hello world</h2>');
    let name = selectorTool(column[0]).text()
    let processed_name = process_name(name)
    processed_name = processed_name.trim()

    discription = discription.split(",")
    let order_of_match = discription[0].trim()
    let venue = discription[1].trim()
    let date = discription[2].trim()
    let run = selectorTool(column[2]).text()
    let ballfaced = selectorTool(column[3]).text()
    let fours = selectorTool(column[5]).text()
    let sixes = selectorTool(column[6]).text()
    let run_rate = selectorTool(column[7]).text()

    let obj = {}
    obj.kind = kind
    obj.name = processed_name
    obj.order_of_match = order_of_match
    obj.venue = venue
    obj.date = date
    obj.run = run
    obj.ballfaced = ballfaced
    obj.fours = fours
    obj.sixes = sixes
    obj.run_rate = run_rate
    let pathh = path.join(team_name+"/"+processed_name+".json")
    if(fs.existsSync(pathh)==false){
        obj = [obj]
        fs.writeFileSync(pathh, JSON.stringify(obj))
    }
    else{
        let content = fs.readFileSync(pathh,"utf-8");
        let json = JSON.parse(content);
        json.push(obj)
        fs.writeFileSync(pathh,JSON.stringify(json))
    }
}

console.log("after")
