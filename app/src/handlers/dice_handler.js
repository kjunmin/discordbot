module.exports.rollDice = (message) => {
    let str = message.content.split(" ");
    let diceFaces = str[1];
    let authorUsername = message.author.username;
    if (isNaN(diceFaces)) {
        message.channel.send("You did not input a number to roll!");
    } else {
        let randRoll = Math.floor((Math.random()*diceFaces)+1);
        let messagePost = "!**"
        if (randRoll === 1) {
            messagePost = "! Critical Failure" + messagePost;
        } else if (randRoll === diceFaces) {
            messagePost = "! Critical Success" + messagePost;
        }
        
        message.channel.send("**" + authorUsername + " rolled a " + randRoll + messagePost);
    }
    
    
}