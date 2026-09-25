const names={student:'스스로 공부하기',teacher:'가르치기',book:'살아있는 책'};

export function editionName(kind){return names[kind]||names.book;}
