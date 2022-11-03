export class Song {
    constructor(name, score) {
        this.name = name;
        this.score = score;
    }
}

export const toERC721Body = async (song) => {
    let elements = [];
    elements.push('data:application/json;base64');

    let json = {};
    json['name'] = Buffer.from(song.name).toString('base64');
    json['score'] = song.score;
    elements.push(JSON.stringify(json));

    return elements.join();
};

export const toEntity = async (body) => {    
    const json = JSON.parse(body.replace('data:application/json;base64,', ''));

    return new Song(Buffer.from(json['name'], 'base64').toString(), json['score']);
};
