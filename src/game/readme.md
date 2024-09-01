# Game logic

## Diagram

The drawings or diagrams shown in this section can be modified through the following link [Draw](https://app.diagrams.net/#G1mIfIJ19J7oW2Iw8vo3GrpQjWOFiF0zVn#%7B%22pageId%22%3A%22kow-iseRG58Xen-pIDAg%22%7D)

## Weather

![alt text](../../crafts/image.png)

## Bullets

the logic of the bullet may consist of the following diagram

> **Why this logic?** <br />
> The idea is to have a better bale structure to easily manage its lifecycle.

![alt text](../../crafts/bullets.png)

### Bullet identification

| mobile    | tipo        | value |
| --------- | ----------- | ----- |
| ARMOR     | S1          | 0     |
| ARMOR     | S2          | 1     |
| ARMOR     | SS          | 2     |
| ARMOR     | SS_1        | 3     |
| ICE       | S1          | 4     |
| ICE       | S2          | 5     |
| ICE       | SS          | 6     |
| ADUKA     | S1          | 7     |
| ADUKA     | S2          | 8     |
| ADUKA     | SS          | 9     |
| TELEPORT  | S1          | 10    |
| LIGHTNING | S1          | 11    |
| LIGHTNING | SS          | 12    |
| BIGFOOT   | S1          | 13    |
| BIGFOOT   | S2          | 14    |
| BIGFOOT   | SS          | 15    |
| JD        | S1          | 16    |
| JD        | S2          | 17    |
| JD        | SS          | 18    |
| ASATE     | S1          | 19    |
| ASATE     | S2          | 20    |
| ASATE     | SS          | 21    |
| ASATEION  | SS          | 22    |
| KNIGHT    | S1          | 23    |
| KNIGHT    | S2          | 24    |
| KNIGHT    | SS          | 25    |
| KNIGHT    | ION_SS      | 26    |
| TEST      | S1          | 27    |
| FOX       | S1          | 28    |
| FOX       | S2          | 29    |
| FOX       | SS          | 30    |
| DRAGON    | S1          | 31    |
| DRAGON    | S2          | 32    |
| DRAGON    | SS          | 33    |
| NAK       | S1          | 34    |
| NAK       | S2          | 35    |
| NAK       | S2_2_UG     | 36    |
| NAK       | SS          | 37    |
| TRICO     | S1          | 38    |
| TRICO     | S2          | 39    |
| TRICO     | SS          | 40    |
| MAGE      | S1          | 41    |
| MAGE      | S2          | 42    |
| MAGE      | S2          | 43    |
| MAGE      | SS          | 44    |
| TURTLE    | S1          | 45    |
| TURTLE    | S2          | 46    |
| TURTLE    | S2          | 47    |
| TURTLE    | SS          | 48    |
| TURTLE    | SS_CHANGE   | 49    |
| BOOMER    | S1          | 50    |
| BOOMER    | SS          | 51    |
| GRUB      | S1          | 52    |
| GRUB      | S2          | 53    |
| GRUB      | SS          | 54    |
| DRAGON2   | S1          | 55    |
| DRAGON2   | S2          | 56    |
| DRAGON2   | SS          | 57    |
| DRAGON2   | SS_CHANGE   | 58    |
| RAON      | S1          | 59    |
| RAON      | S2          | 60    |
| RAON      | SS          | 61    |
| RAONSS    | SS          | 62    |
| RAONMINE  | S1          | 63    |
| FROG      | S1          | 64    |
| FROG      | S2          | 65    |
| FROG      | SS          | 66    |
| FROG      | SS_CHANGE   | 67    |
| KALSIDDON | S1          | 68    |
| KALSIDDON | S1          | 69    |
| KALSIDDON | S1          | 70    |
| KALSIDDON | S2          | 71    |
| KALSIDDON | S2_CHANGE_1 | 72    |
| KALSIDDON | S2_CHANGE_2 | 73    |
| KALSIDDON | SS          | 74    |
| KALSIDDON | SS_CHANGE_1 | 75    |
| KALSIDDON | SS_CHANGE_2 | 76    |
| KALSIDDON | SS_CHANGE_3 | 77    |
| KALSIDDON | SS_CHANGE_4 | 78    |

> **How to describe Action Bullet?** <br />

| First Header  | Second Header                               | Código                                                                                | Mobile                |
| ------------- | ------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------- |
| CHANGE_BULLET | Switching from 1 bullet to another          | `{ "type": "CHANGE_BULLET", "metadata": { "bullet_id": 1 }, "time": 3000 } `          | ARMOR, TURTLE, BOOMER |
| CREATE_MINE   | Create mine                                 | `{ "type": "CREATE_MINE", "metadata": { "position": "IN_EXPLODE_BULLET" } }`          | x                     |
| FREEZE_ENEMY  | Freeze your enemies when the bullet strikes | `{ "type": "FREEZE_ENEMY", "metadata": { "radius": 33 } }`                            | x                     |
| WALK          | walk when you come ashore                   | `{ "type": "WALK", "metadata": { "DIR": "LEFT", "DURATION": "STEPS", "STEPS": 20 } }` | FROG                  |

### Use cases

#### Armor

> **S1**

```json
[
  {
    "id": 0,
    "img": 0,
    "size": {
      "w": 0,
      "h": 0,
    },
    "explode": null,
    "type": "?",
    "delay": 0,
    "damage": 0,
    "regeneration": 0,
    "on_shot": [],
  },
];

```
