const die_values = [1, 2, 3, 4, 5, 6] as const;
export type die = typeof die_values[number];
export type dice = die[];

/**
 * Gets the value of a die-face for triples
 * @param die die-face
 * @returns the value
 */
const get_triple_val = (die: die): number => die === 1 ? 10 : die;
/**
 * Gets the value of a die-face for singles
 * @param die die-face
 * @returns the value
 */
const get_single_val = (die: die): number => {
	switch (die) {
		case 1:
			return 100;
		case 5:
			return 50;
		default:
			return 0;
	}
};

/**
 * Gets the number of points for a dice-throw
 * @param current_points the current points
 * @param dice the thrown dice
 * @returns the new number of points
 */
export const get_points = (current_points: number, dice: dice): number => {
	const dice_map = dice.reduce((map, item) => {
		map.set(item, (map.get(item) ?? 0) + 1);
		return map;
	}, new Map<die, number>());

	const points = Array.from(dice_map.entries()).reduce((points, [number, count]) => {
		const triples = Math.floor(count / 3);
		for (let i = 0; i < triples; i++)
			points.push(get_triple_val(number) * 100);
		if (number === 1 || number === 5) {
			const remaining = count - (triples * 3);
			for (let ii = 0; ii < remaining; ii++)
				points.push(get_single_val(number));
		}
		return points;
	}, [] as number[]);

	if (points.length === 0) {
		return 0;
	} else {
		return points.reduce((a, b) => a + b, current_points);
	}
};

/**
 * Gets all possible dice throws for the given number of dice
 * @param dice_num the number of dice to throw
 * @returns the possible dice throws
 */
export const get_dice_throws = (dice_num: number): dice[] => {
	if (dice_num <= 0)
		return [[]];
	const smaller = get_dice_throws(dice_num - 1);
	return smaller.reduce((acc, prev) => {
		for (const n of die_values)
			acc.push([...prev, n]);
		return acc;
	}, [] as dice[]);
};

/**
 * Gets the probabilities and expected new points for the given number of dice
 * @param dice_number The number of dice to throw
 * @param current_points The current number of points
 * @returns the probabilities for each new points and the expected new value of points
 */
export const get_probabilities = (dice_number: number, current_points: number): [[number, number][], number] => {
	const points = get_dice_throws(dice_number).map(dice => get_points(current_points, dice));
	const denum = points.length;
	const noms = points.reduce((map, points) => {
		map.set(points, (map.get(points) ?? 0) + 1);
		return map;
	}, new Map<number, number>());
	const percentages = Array.from(noms.entries()).map(([points, number]) => [points, number / denum] as [number, number]).sort(([_a, a], [_b, b]) => b - a);
	const expected = percentages.map(([points, percentage]) => points * percentage).reduce((a, b) => a + b, 0);
	return [percentages, expected];
};
export default get_probabilities;