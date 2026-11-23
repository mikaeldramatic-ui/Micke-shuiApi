const animals = ['unicorn','dragon','otter','lizard','magpie','sloth','tiger','monkey'];

export const generateGuestName = () => {
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const number = Math.floor(Math.random() * 1000);

    return `${animal}${number}`;
};