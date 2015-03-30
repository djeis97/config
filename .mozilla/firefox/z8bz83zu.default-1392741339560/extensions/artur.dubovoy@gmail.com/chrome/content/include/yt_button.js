/*
 * Insert FVD Download button in youtube interface.
 */

(function(){

	const EXT_IMAGES = {
		"flv":    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAhtJREFUeNqMU79rFEEU/mZn9tddTrIrmuAP8Ad4YhPE3kpCChux0Jg0/gUWEZSoGAQ7wTTamFhpLWilvQpWBsTkgnf+gKQQ9RJQL7u37vPN7O1ejjvEB293Z+d933zzzRtBRNCxunvvlzRJ9iNNMTgELEt8rja/Hsj/aKzICVbCETp6fx6GwLK6OD3+wykEljZ/wr8y+7j6qzmdE5iHzuXhXUSLD2m5HFItGClSj2lhgd5BkY63d+apVg4e5QSqR2U7hj00BMt1ugLi2CgQysEGj8dmLmHJ96Zq129qmRes7XtEK4J0XUjHKVL5Pr4/eYrwxHGsCwfvpYexrRZSokmNsrbjEUcZ0O6ksiGFRJstCBcf4BjFqOzZByTtrL6HQMdWTmBnyWaWJsYx+vwZ5PAObN64Bel5pi6Prgfssp5QTCCU0g6BohjhvbtI6h/x7eQpWDtDKPbIEAgxQEGkFbiZfEuiPHkuW+XwQYyu1bMt8byu61egN8XmKC4QzE5RG975s6C1dfyeuw3BZtp+CaR7hOtyE1SPiVqBrSD46NTFacjqEbRm50CrH7hSQfoeTN9pBaJPAbJjZNftq5ehTk8grTcgXr2BKpWLPZvuG2hi7kEQGDA1PiGZuQZZqfS2dqdu8Cnw+TpuCTgzZXxwXJ/Bou9SobVRKCoIfgAvVl6+Hkfncv0zGKzrzWd+G3nFQ/wK8P/RZGzjrwADADmH0oUUM6YwAAAAAElFTkSuQmCC",    
		"mp4":    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC8UlEQVR4nH3SX2ibVRjH8e95T94kK1lTF5Jqu/WPxq3iOlY35zY3LwSxN0M2qVNvBRmICLv3RkEUvFBBr71q2cCB0CsdLRuzy9pNa7J2HXHSbItNljZNmr9vzvue40VptDL8XT0XPz485/AI/icff/p5aDC+70i10TpsSXly+sfx9364dOnRvztia7iRSHzw/P797wghap7nOZ42Qw72s8WKQ8NRFMsbqHz6wvp68ebk5OT4xMTEXwC+78cv7hsaOfm+7VXflpbV83sySTKVolBYAwzCssAY+nb3EI11nz19+szZ2dnZW8AmsHg7tXdH34nz8UgQKS0WFhYprfzJ+TePoVwPAL8d4KNvJhl9/TVSqSS9vb3hrc19c4lfpl4d+xBwQQiqtSq5XJ7rMwk8bTBAIOBnvVQiEAgwMDDA/Px8VxuYnpqqnVt9mHyyL3rAGKjX6zzK55n7NYc2myW/30+tqlFKEQ6HiUQi/wAAG6sPfqY/egBjaNTr1Bywu4fxtAbAsiQbv82glMKyLMLhcOcWYAGkUzd/8kkJQNNxCNqCFwZiHNwT42B/jBfjPVSqVZRSSClpNpuBbcD1a1enOwJCe9rj2NHjjLx0nJyyWTNB1nSQXMtmbOwt9vT1o7VHJBptf2L7Dq5cvXJtZOTQyxpB3WmhPQ3C2nyntPD5JJYw+CxJrlBc2ju4+7n2BgDNhnNfC0lTGeqOS7XlUnNcGspQV4Z6S+O4AldDvqyGPvvyq13bANv2tZSnaWlBJlempSX3V2vkyw0yhQoukuxqGWUExY0Kw4eOjm4DXKU8zwg8BJdvpZlZfEBiucTtbIUbd3MsZQp8d+EyRkg6d4ZoOu4r2wHPdQ2CuYV7PBV7guy6Q6wrhCskR4bj1JVHJNxJqeawci/57djoiXPtOwC4s3gnY3eEM907o/27OmxCHUHSf6QzrquL2eqy8UlhHX46ZC0vJQMrD7N3eVwGn4nv+OSLry+eeuPMu12RSPSxpf/kbyr9W3ISlXDzAAAAAElFTkSuQmCC",
		"mp3":    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA5dJREFUeNpsk21oW2UUx//3JffevN50SZYsrm1SyyptVkrbLXZTit2ouslwijKduIF+EYcKDhTFF3AyXxC/DffJLypjICjaKa3spTDLunYd2Tpns4Ssmc3SvN/kJrm5L48384uIB35fDuf/5zznPIfC/4TFwrAul9jBWWiK3jDc6nvs+EaaUsM0y/RRDPNAo6VvvXxp+f1GvXmO/bcwMhAZ3rP/8Mvbh6MP+73u4InpHLWSg1rVKdGgeV5tEkhNHbliDY3yXQ80GfcMKJMXj77x7uhzb77nkn18gDPAkBJWqgpIQESL0lFRgVydQKYIwBtmm5oOQ/nH4NBrh97a9dnhY4kMQelWEVxZgI8lcHe6sFRkoOsWiFYGw90W9PtpxP5oYi5GdIABu6W3d8tLHz/9YbxxE06LE1KoB/FbLOolDq1yBm+PODAx0o1eHwfRxtx76vGfDVw9dcPTWFsE/eS+iQMR1hBGKRUDzgJ84hJKnX8i1lw3uFbN2NnV0vxWmThNcbmloSDXUZIVHHhm4qhIknY2MjQwYqm74KsYECkZQb4MD8kTEh5Lz19WuIUrsRmrwO9YTed63C47baN1VIsSHhyN9ld2PbqPtgtuB4sgaGyGpRmCZ/1+RLJBErK6lGyxUnj9lVePZNfuzOnlhMznFyFqSRBFgsDKeGQ8Osmm0oW/6oYPksZBIQbU9lg9FC3XjE0ddqH16efHvrS53aF5aYnZGlCgKE7UWiEoTQOBgHUzfe7C7HSd5aEKNhC7A26/F93hLggO0UmxFo/PO/jC1+fz0V/kbttMfhzfZh/HxTUvmm4JJa0ss2d/m/7p2tWl5LaxsR6aEGQlDT9cr+JSXEVOMddEU3xICCF+TcPC3S7krU6kNBYJsQBp5vbvjGpGKpGQDh58/okOK0e/810aP6ZdWCyLIFIJ+yMsbDoHWeExFZeRAQHrrqLPsV46/8mJI+3FutKrt2upRNK+e3JyKF1kcWqhgoZew5BXw+B9NvAqBadDQDDIgLdU8dA2GpmTX3x0ZW5+qm3QHptzefl6dXZ21nhqd3/ns9FNwnavjh1hHm7zB1rNAlpjENjoQ8BRVFdOfvDN9OnvvzLTlfYZ0Ca8ic8kJPDc4J69e3eOT0wO+jvDQcHmsBmybtxZzZZjNxZunv319FQylTpj1qZMGtR/LrndkWBiN9kg8LzXarM6DMOALFfLmkYyZj7fFpoYbcHfAgwA8IWCw4Q+/vsAAAAASUVORK5CYII=",
		"pdf":    "data:image/png;base64,R0lGODlhEAAQANUAAOR8gd3Q0uCsr+lARuKUmN+4u/JVW3t8fJ2DhPDw8N7ExuVwdbEVG+FES9s+RDc3N1NGR4UPFOsoLzsHCc8YH+dYXqeNj3YOElgKDXI+QG9iY+OIjOZkaehMUqWlpm5ub+0cJMDAwNzd3v///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAACMALAAAAAAQABAAQAZ9wNEoESoaj8JkyCNqigjO5icEqlqvHedUuBQFOACnYtPRUK/ojodBQSS4TKcgKtqOuk1AoaPQhrgWA1l0Un93Bx6Jih4HEQhCaGkeGBcTIQYGDQ4dnB2CC35wUXNRdnheHQGlhngBFQAcAyADHKYeBB2ghKYQGR+/wMAPIUEAOw==",
		"webm":   "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnBJREFUeNqkk8trE1EUxr+5M8lMYhtT66sFK5ZWfEAXIv4BBcXqVsGVC1F04UrEx8bHSqTLghUfCEVcCRV15aIrKYW0sbW2SmrbVPNqnpNJZpKZZGY8Ny2lqLULL/ODO+ee+91zzzlXcF0X/zOkaZxrTEjnlFaw+n1bpNeKLD52XDcJAfxDxbAhMMCnSGBk6b/5CVOjWcg+kf6x4uQ4blc6ZhxaipTupOLGhGXaD8h5r9BY3XiwdfM6EwXYtot8utq29L18a1XoIWNCpyBsLtAY3JELOStCrYsR7UZuuRK26+4ALe1nv0XENgptTcgBinlra2yxfDWVMMbNmj1Ia22bCqwXkrwMdA3Eo3rzu1fRK7EFvYfbGlX4Z4IoAtqHslbH/ExRmw0XhuhaA2W1FpFoTSCkjTbyspXyNSx81XLfJtXn8cXyMyr2nL/JA4/MYNdcqFkTkgIRNqiZRJeJ0krhS2oNc9PFzEwo/yK3XH1E11hyKReyXwR3LeYsJKI6MqkqpPBEFu0dflimYxYyFiJTajLyRX2y/NN4auj1uCyL8NB9A9s8SCcqiEyq0OiAtRw1B704cWYPAi3eHdlU5XQmaXyoGk6iWDARm9d5hyIQ9GB4tg/3L4Uw8ib+94QpfgmtuxU0k/Nq0/iJy41Jk4SQeRbH6aA/3gJxnuetatQLRIBrEUeIj8RF4ujOdt97hbGxjq6mNInfo6g6yG4QJi9mH3GNuEv0Ehd4WxMniSQx3N0TvK7rtbFjvbtu0wM6TLYfqxF2Ulqxj8gTFvGS4DYeyTjRTRxo2S6PehVp8O1QdGRhVjtIEXwme4kf9EuAAQCi5QsEyi5VUgAAAABJRU5ErkJggg==",
		"swf":    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAwBQTFRF0NDQwQMDvgMD09PT0AEB6urq2QEB39/f+fn5wTc39PT0t7e30tLSPz8/sbGx2gEB48HB7Ozs29vb6+vriIiI+Pj4ra2t4uLiuwEB1NTUgQEByEZGr6+vmJiY2AEBxwEB6wEBvg8PvzY2Hh4euxAQxzc3xEdH3Nzc6enpoqKi8/Pz6cbGwMDAZgEB+QEBwTg42NjY4+Pj37Cw1QEBhAEBtAEBx0ND8wEBq6urqqqqvLy8rq6uwwEB5ubmvr6+o6OjoAEB5eXl8PDw4LCwylRU47Oz7+/vyAEBxERE/AEBlJSU9vb23wEB3gEBx8fHvgEB58XFk5OTv7+/1wEB6Ojo4eHh9fX1tra2ww4Og4OD3Le3qgEBvb294gEBlwEB0gEB7u7upKSk3rm5swEBwcHB9/f3+/v7/Pz8+vr6YwEBJSUl/f39rKys/v7+////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAg1O7SAAAAHB0Uk5T////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////ALdhYtIAAADdSURBVHjaYsjPz5fkE8sRy8nJkQkFchiA2C4jTMtJ0FaH3VoIKBDs68PGIu9vGu1gn8ZuKZTPEK/naa4Qy8ZiExeZlsae48iQLMfPz2bM4i5hIisi4qXJwyCVCQW64iGGfoFWDOrMzInMDEBgEGXGmMATzuAmLMwtyMrKqpEUwejBxcUHsjYlIxUIVBmNvFNFc8AC2Wkcos6MipwCGRxQgfT0NBcmTiWBjAy4gCuTfhpHKkJAmkklAKgsOxsqkMukpp0LBHl5YIGg7FwoyMuzAAnE8GZBgTIvN0CAAQCCX0cVtLCG1QAAAABJRU5ErkJggg==",
		"3gp":    "data:image/png;base64,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",		
		"hd1080": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACSklEQVR4XqWTT0hUXxTHP/e+92beONiMEPgHNNGFLcwisxb2w6SNtMgooRbCRERCQVMUmiC1mTYVlUL/CYlqk1huCoIIzbQi2gSBLrKgoCjyD/Mb572Z9+Y2vYfaokXYB845997N+fI994jRvroZ5dhRpVw8FCBA8GcUoBQIqSH1wKx4dr5GNcZvsRye98bQFzqvXXeMrOsy8S5GxarLgMuJjg2cujiGWVCAYQQImkFqqwo53LGFxpZmVM5FCnzCIYMVhSYQIhIJ5c8hwmGT00fr6Wov4eU5jV1NhXz65tBz5ikAQoDEB6lJAoZOfUN/vmrousyHxtn+SfruJwmbgsT+lSghSKezAAhAx4dcDpx8evN6H2vqLvlOKdAkaBoEDUHPzWkEYIYCi4ZKhc+8DclUDsiS/N/Oh0UqnWHecsm6UHskyNB4horSEImurQAopZYUvB34DEX/eVI+Tt0B5iE1yYHdZfB9kvSPD+jRKmR0NaKoHB+WTIxsNECXdMYfUVLaxsnuGxyKD1HZ/JDOazPUHNQ4fmUapXy/fBMFEoFHwAAMye3B93z98oC7915hmjqPr25maDTJ1HUYHJ5BD+pEqnsAkFL+NgUJSH80oDxpmpS0xl94b8rvCJog0d2yKF8uTUH9Sp4xILy747hMDG/DcV2Ecln4dIkLT/AQAonCw7JsSNu076ykuLiVPW0NpFIWZesH2L4pQHnMYkdjAdg2mYyDh4J/2oXxvr3oc5Y2MtYba1KeRBB/s4nC38a5tDYigGogyvKY/QkAE9jPSl615AAAAABJRU5ErkJggg==",
	    "set":    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAIeSURBVHjalJO/axNxGMY/33i5/GjSxIYkGFtL8T9wcnToKjrZLmZwcRCKIDp1EFxUEKRYRJDQSYtDLEgFt0gEiyIqFqQgwVJpm6SXJpdL7q65u69DtG0aWvHZXnjfh/d9n+eBI/CisCyfLn6UR/X49hf54op8XljeHTBsp6d5Nl+UM/OFHkLlIKNpO+SLKxJgMBKg4x1jdmFJupaFu+P2bdBHEA+HGB1OAuA6Hju2wdhwCsNoo7fMPgIBkHvzRYYCCslYhFRiiIpWY/XXOpvbbQDSiRghReAPBNFbJmWtQa2q8eDGhFAATiWj6C2H4/FBKlqNdx++cvvqBdFz/8KSHIkIGAhRaxiMnkzvPXH8zGnhyO5v3n/+1jcMcO3iWbFWbdKxLTqOy9TkOQGgzL0synAiifKHwKpsHSqZbVkQigBwJ7coY5EwvqBR321omzbCrx5K4Hh7ChqGTennGsrk5fMCIP/2u2y2TeKZDP+C1Gvcm7okeo3k82FaJieGBsnNvepz3/1nBRkNB3E9j6an9Mr45PUn6XQcxjJpTLuF1bKwNzZw/SqKbVH2BVCDAWIDKlrTRtvaRtfrPJ6+0pXxR2m16yq/QjwcRFVVxHD3FKfjkAHqjTZa0yaogOeDSDy+t8F+zMwXpF+AdiAHjtmi3mjw8FZWHBqmvwEqVWtMZ8dFQ9cxdJ3p7LgYSUVZ3yzzX7j5KC8nrt89Ms6/BwCDq+0MBWPO0AAAAABJRU5ErkJggg==",
		"like":   "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAMAAADarb8dAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjE4OTE0Njk0NjJEMzExRTI4MzJBQzI0QzdFNzBENjI4IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjE4OTE0Njk1NjJEMzExRTI4MzJBQzI0QzdFNzBENjI4Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MTg5MTQ2OTI2MkQzMTFFMjgzMkFDMjRDN0U3MEQ2MjgiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MTg5MTQ2OTM2MkQzMTFFMjgzMkFDMjRDN0U3MEQ2MjgiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5J5mcSAAACE1BMVEX+/v3/8LPewHf58Nvn2cP/9Mn27t/rzojo2cT/6YTw2qPy15L/22H/3nW+jjzrzYb/1V//1l/q39HGkzXClEfx15H73ofw2aP07N7Io3D68dz48uX+9+HjuVb+/f3myIby0Hbvxl3/3FT/9cn++On++erw2aLszon48ub+9+D++OXhw4383ofZqUn84ov/7pT9+/r944vkulj+64bjxYTkxob/44D/3nTVqUzXwqTXqknrzYfHom/003X69/P/9s7HpHD734jGlDa7hzazilLFoGzTp0vZqk3Oqm/Yw6by2qb/7rH/3VX7+fbuyF7GkjPUvZr37+GwhUb844vp28b74YnRrWm9jD3sxF2pfUDHlTmofUDku1fRrWrjw4CwhkXXwaTHlTjz0HPy0HP734f07N/yz3T/2m3iuVfz0XapfELMnEC7ijm4jk7s4tXrzof/3nD/7rPmyYe0iEPgzbLwzXTgvGbp28Xiz7X/33Xiw4D68t368t770FDSsnzFoWuqfUDLp2y/jzy4jEzGkzmofULGkzby3Kjz0nTkulfiz7Tx15D/9cr/9cvMnEH+7JT/5IH7z1DEn2r/9s3fzLHwyGX/9cyrfkDhxYzy1pC0hkXClUbsxFz68d3/3m7+/fzGlTbOqnC2jVP9/Prxy2XivmjYqkvy2JT38OP/+eTixYO8ijvkxoX96oT/2W3kvFr///98qdT8AAAAsXRSTlP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wDX9FxkAAAA9klEQVR42mLYsGH5nJkbwEA0gnvDBgYp9fWaGfzVGzbUWMfIdLIzM5iqKRf2tssbLC7ymubNKh7HsGKBHq+jv0RQfKqwIa9OCxsDw+oOq8w6SyYmT2dbXQWPDQwbWCaVLGpt7tfPzXKZYsMBFNiwIaFsLecEM07jpQFADkjAt2FqQfq6eUum20EFVPNm8QgI8hQLqUAEuP1MZivVTvQRWaXYDRSYm2+k5dbUFx2ZzWexUhbosDVcPYz2M2Ll5odpT2Zk5apiCEwMNU9xkt6wQaMtuFIsCuiw8ORlaY0g03KS3EsXghxWXyEZAvIsh2uXQ/kGgAADAAD4XjTtv1M+AAAAAElFTkSuQmCC",
		"bet":    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADL0lEQVQ4jW2TS2gcdQDGf/+ZnflvNvtIaJ5skm6bbcl2CVtiDRRsKmgiJODZ1oMX6aFEjOBBEE9KL+qppxJyMqBgC4pE0RZSH9GSdAiSlJA222w3G9JkQx7dzcxmZmf/HkSoxu/2wfc4fHyCoxCxUNMLtl274KH6wQe8Oaj+Cp4F1P4lfp4ku7rOOGX1USQlXrswUG3s73aoVX2Wf9e5fVfsLjx1buM6HwOLR2p7U70DpxM9uVPXz6qrpTPqgTqmlBJKKZRa0FXx3aj6pLtNxepjTwgEXv7HpwGc7zufJCgmd95rOh46EcYIewB4roF7CAR0mo4F+DAa4JoIdwWDwS+Q8jSADujdLR2f5i7rF7evhHjl2x7C9jOWfjD56kaS7386QX6jiZO6QWgzRPNDm6ca0QVDRXG97/SRV0d6dsKVa9kxWa/qDxmsP0evdZFvbhWQoS5QbTwqdvJEi5Nay6PlnmH6Gr9JFfcMYyoga9q5vYxqUZ0BEIpH21k+eP1tNqtFisVNYrEYdXUh7vz5AD23z/uaRqKmOOWL5vtB+aKmBfS+qlQENxThtSDO3R1KhyUuvfkGzc0ttLa2sfr4MYtzfzCrS7LSYNvQMBGYht4f0BtlpfUXSFiKYDBAnSZYWltmpHeEvr4+xsfHmZ+fJyQEK1JyudOgUqmwd+AT0Y2KZhjGfd3XlHAUwZpBJBohn88DkE6nyWazVKtVTNMEFI4G5VqVmhCYpnlPC4VCc+FoOF9yyrg1j62tLW5+fZOVlRXi8Tijo6N4nofv+38PX/VxnQpBKdeklLO6ZVn7AwMDrUtLSy8Vi0X29/dZX18nlUqRyWRIJpNYlsXq6iq6rlMqlfA8j3g8fmNxcfGWBmCa5ueZTOZeuVzGcRwApqenAYhEIgwNDeE4Dnt7exwcHJBIJGaFEJ8BSgewLMseHh7+ubGx8WyhUDheKpUoFApIKdnd3WViYoLl5WWklKTT6ZmGhoa3ZmZm1o6caWxsrMG27Xey2eylXC530rZtaZomvu8fdnR0rLa3t3/puu71qamp3f9943NB7UqpQdd1Bz3PE0KIO47j/Dg5ObnxX+1fV61hKgscqj8AAAAASUVORK5CYII=",
		"nim":    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDoAABSCAABFVgAADqXAAAXb9daH5AAAAIGSURBVHjanNNPiJVlFAbw3/nuN9dxakacGXM2YUrYoty4EmHIlraJwH0FbUqIGAjcuG6Ri8m0jQhKDKkQ0UC41UWg2aaNzCZnGCLMv+XM5PXON99xcb+B682VD5zNe973OTzPed7ACSzgIxRYxgyOYx9aOI+fcRoT6OArXA7M4XO0YurtdaO7n2A1Hy2O+fvqiNHdGVOH7qvXK3V3Ipfnh2x09uABFkqMiWIlpt7pxKuHp0VxQIrc9uYZ5cjtmNw/HsOTR2W9VbHlgrSUS5dm8BBfljglyiqmpqnWjsj6Mwgxnjunj8n113T/mSUoc0HRXsIIVjWa7yPVXVgj9MrH6u5ecoX4Vw9dEipsbBIcwxYDCCYKOZOpRD3Q/gbfQbnJNICHaIv4INIt/Iftff23GgnLRXM5+19n5s3M/BbDEb7A+MCgd3FoU8JMs9d+tFKcxE1MYusAQd3vwadoDxCMkH9m+vp/zhRDcKMhV+BgL20BL/XU5LagneJcZl7vnUVbXQ1ZXYSfML9pYtETXlGMzmu176jruzY6tapTaY99olUeVle1tb9u5O2r2/E9zuJi4H38qGiLVw4wuodMHv0h7/0qdr1H+TIri/LOL2Pq9TdwuVnlbGC6qSdNHq7hN3zY580qrmAWr2NXE8BbRePwc3L0DIqG5IemHjdGznkB7MDvzff3dABzjbnViCCaxAAAAABJRU5ErkJggg==",
		"fvd": 	  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAoZJREFUeNpsk0trE1EUx899zEyatk6xImotaLUgFXGnIijddS/FhVsxwb1fQFz5GfwIElwX68JFN6JQi0VbU/rQJmmbTmIm874Pz0zoZHwcuDB35v5/95z/OUMuPnsNJyGVOn9j6vTynctnphKp5Ml7Til0o9haWmu86IfJS0ZzCXApVb4JhaJzF+zJx/dnbT9K8vclg8HusQfv1xujThyDydgQAEDyDcVnL5LiR9cHP84TAMug0HRDkBoUIaQoAc4owdR1tkm/RZhRL5TgJwUAKvuRApWdIdlBgmVRRhCQFkQ0CKUyciQUOIGAqAAwOIVeJDOATvV4KTfYSQkAaRapWsrMB+iEAmJRAAgExAKU1kDxZm7wogdI1SkEUyIKTZa6F0gEiCEAs+wjVEodpmlnGhhYgR7Q51gXwRYmJZNPlEcsuxskkBS6w6iCSFGwx0oLwg1QQjgjdFxI+ZZj3J6+NL1gWhYorEFZBmx4KX/YqoHBDKZmZubPCjVP0ZN26zA8ODhc4b4fPNpvtl7N3rz+wBotQ5IkxS79ESZlMMIZNLZ2Oq3WURVLf8PRUafXdp7Uv3xV1+7dWixP2iAT8Y84bR/lHPbXN529b/WKkqpGEZYNJePc+dVqVzdWPtZEHIE1bgErGcBGBouXTTDHTGhubjnbn9aqGsXpHGRa++7DwRRSEgRdd7l35Fw5NWnPGei2iiLQ2A2CM/Jzve5sfVitKCFrFEvJhglXDhhAaBD0vXfu4fHVssnmCM699DxobG47O5+/V7VCMf4HBEgO4H/XyhhzXMet1Fc39PS5iUXXjzv7zU5Fq2HaxeD/c5sy6nh+/HR3ry1ipZawqTWSTav+5+xvAQYADRQ40Hwcd4cAAAAASUVORK5CYII=",
		"AD":	  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAx5JREFUeNpsU0toVFcY/u553XPvPJLJazLV2IfJBEJCi5YsSlNsA7rRFmkXXXRVVwV3FlK66aZQ0C7soptQaDcVjCApljQLo3VRihSNFh/BTNI8sDM6yUycZCZz3/5XqZTogZ97Dvf83/f9/3d+I4oi7FxuiN65qt/r+f5LKR5i3ReNfKvYaNfsKv2u/v+usQOg7a+yNzZZqH9yvbid61dbxtFsA7edFJacJA7l0xdGe/QXdO/OcwAe0PHr/KMfbiyWPugyGshqAz2JCC0mh6kkZtc5Ts0CI32ZytejnR8qht+fARBE7tbiv5PLq8vDOTOEEgLgAkwocKUg6ZzWHIW1AMdnmhh5Pbv27bsdI4JhjhGIqFYq47X7C8Mxq6EsRFKDmxakaUJJCSkFXAgM9iTw3aEW/HK71nF2vv59SAIZKThQKhZHGbFIU8OkJG1ZsG0blhWfSQGBCCFhCo7yIx/upovJwtZ7W370tnAcZ0/TcSz5hElCkeQ40nbMzrBNzSGpMKWB89dr+HKKTGhLodwIUKz73cJ13WYQBOCcgzEGSysktMS1lW1MzdZw7J12BFTn+B81/Dxbh2qzkWlRIHZUnJAJSvLjRFAzTUWNi0KcnCpj/Oo2tpwQf656eOAwrAcc6e4UTFtAkTM8lkXmCZIbCmL3fQ+1jSq+utjEuUUTmVwKOUtgyYsgkxydVA4n70xyw0oItGqGtGR2DFDTWoflBxV2+rKHCytpZPemoZIKBjdgMoPsZBC0lwRiWQyMvrmU9HM2f2LjlWx3drpS3cA/m00kd7VDJch/uiSJUVscCZsjmRRIpQS0LeEzjsN7rJ/aNLsUAzitrZnPBgcHlz/atYxuLCGybLKPPw0qQyc1hQVDawReEx/vxsL7L+tvds7C/sLcnYkzk7+9Nh32o/Hqm9DUVElPSG6WIPw6dnMXR/oyE0eHBz6H0qsvGqaO9YelsYszMyemS4ax2PUGsmt3sb9xz+vL5xf2DQ2cfGVv748u+apoPl4E8N86XL6/kj13c2Wj8Pe12qcH33LyA0PzfhgUOX+aGL/QeD0WYABEziK94bE8yAAAAABJRU5ErkJggg==",
	};


	
	FVD_SINGLE_YT_Button = function(  ){

		this.BUTTON_TITLE = "Download";
		this.BUTTON_FORMATS_TITLE = "Set Default Formats";
		this.BUTTON_FOLDER_TITLE = "Set Default Download folder";
		this.BUTTON_BETTERFOX_TITLE = "Make your Firefox 15% faster!";
		this.BUTTON_ID = "fvd_single_yt_download_button";
		this.BUTTON_TOOLTIP = "Click here to view file formats";
		this.CONVERTER_MENU_TITLE = "Media Converter";
		this.BUTTON_RATING_TITLE = "Rate US!";	
		
		this.ELEMENT_YOUTUBE_INSERT = "watch7-views-info";
		
		var self = this;
		var doc = null;
		
		this.type_os = null;
		this.message_ffmpeg = false;
		
		// -------------------------------------------------------
		this.getBrowser_URL = function( page_url ){

			var wm = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
			var mwnd = wm.getMostRecentWindow('navigator:browser');
			if ( !mwnd ) return gBrowser.selectedBrowser;
			
			var gBrowser = mwnd.getBrowser();
			var numTabs = gBrowser.browsers.length;;
			
			for (var index = 0; index < numTabs; index++) 
			{
				var currentBrowser = gBrowser.getBrowserAtIndex(index);
				if (page_url == currentBrowser.currentURI.spec) 
				{
					return currentBrowser
				}
			}
			return gBrowser.selectedBrowser;
		
		};
		
		
		// -------------------------------------------------------------------------------------------
		this.insert = function( url )	{	
		
			this.message_ffmpeg = fvd_single.message_ffmpeg;
			this.type_os = fvd_single_Misc.getOS();
		
			dump('FVD_SINGLE_YT_Button - insert '+ url + ' - '+this.type_os+'\r\n');
			var bundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://fvd.single/locale/fvd.single.properties');
		
			this.BUTTON_TITLE = bundle.GetStringFromName( "yt_button.title" );
			this.BUTTON_FORMATS_TITLE = bundle.GetStringFromName( "yt_button.formats_title" );
			this.BUTTON_FOLDER_TITLE = bundle.GetStringFromName( "yt_button.folder_title" );
			this.BUTTON_RATING_TITLE = bundle.GetStringFromName( "yt_button.rating_title" );
			this.CONVERTER_MENU_TITLE = bundle.GetStringFromName( "yt_button.converter_menu_title" );
			
			this.full_HD = false;
			
			var browser = this.getBrowser_URL( url );
			doc = browser.contentDocument;
//			var doc = gBrowser.selectedBrowser.contentDocument;
			
			if( doc.getElementsByTagName("body").length == 0 || doc.getElementById( this.ELEMENT_YOUTUBE_INSERT ) == null)  {
				doc.addEventListener("DOMContentLoaded", function(){
											self.insert( url );
										}, false);
				return;
			}
			
			if( !doc.getElementById(this.BUTTON_ID) )	{

				var button = this.createButton( this.BUTTON_ID, this.BUTTON_TOOLTIP );
	
				this.fvdButton = button;
			
				var ff = fvd_single.registry.getBoolPref('install_setting');
			
				button.addEventListener("click", function(event){

				
					if (ff) {
						fvd_single.show_FVD_install_setting( true );		
					}
					
					var doc = gBrowser.selectedBrowser.contentDocument;
					var location = gBrowser.webNavigation.currentURI;
					var sniffedMedia = fvd_single.prepareSniffedMedia( doc, fvd_single.sniffer.get_files_all() );	
					
					var media = {};
					media = fvd_single.extendMediaByUrl( sniffedMedia, media, location.spec );
					
					if( media[location.spec] )
					{
						media = media[location.spec];
		
						self.buildMediaList( media, button, null );					
					}	
					
				}, false);
					
			
				var elemFlag = doc.getElementById( this.ELEMENT_YOUTUBE_INSERT );
			
				if( elemFlag )	{
					elemFlag.parentNode.insertBefore(button, elemFlag);
				}
				else	{
					var actionsDiv = doc.getElementById('watch-actions-right');
				
					if( !actionsDiv )	{
						var actionsDiv = doc.getElementById('watch7-sentiment-actions');					
					}
				
					//dump( "Actions div is: " + actionsDiv + "\n" );
				
					if( actionsDiv )	{
						actionsDiv.appendChild(button);				
					}
				}	
			
			}
				
			if( doc.location.href.indexOf( "youtube.com/user/" ) != -1 )	{
				if( !doc.getElementById(this.BUTTON_ID) )	{
					var button = this.createButton( this.BUTTON_ID, this.BUTTON_TOOLTIP );

					this.fvdButton = button;
			
					button.addEventListener("click", function(event){
				
								var doc = gBrowser.selectedBrowser.contentDocument;
								var location = gBrowser.webNavigation.currentURI;
								var sniffedMedia = fvd_single.prepareSniffedMedia( doc, fvd_single.sniffer.get_files_all() );	
								
								var media = {};
								media = fvd_single.extendMediaByUrl( sniffedMedia, media, location.spec );
								
								if( media[location.spec] )
								{
									media = media[location.spec];
	
									self.buildMediaList( media, button, null );					
								}	
								
							}, false);

					var elemFlag = doc.getElementById( "channel-navigation-menu" );
			
					if( elemFlag )	{
						var li = doc.createElement("li");
						li.setAttribute( "style", "margin-left: 200px;" );
						li.appendChild( button );	
						elemFlag.appendChild(li);				
					}
					else	{
						var actionsDiv = doc.getElementsByClassName('video-content-info')[0];
						if( actionsDiv )  {
							var div = doc.createElement("div");
							div.setAttribute( "style", "margin-left: 50px; margin-top: 20px;" );
							div.appendChild( button );	
							actionsDiv.appendChild(div);				
						}	
					}	
				}
			}
			
		}

		// -------------------------------------------------------------------------------------------
		this.createButton = function( buttonId, tooltip )  {

			//dump("FVD_SINGLE_YT_Button - createButton " + buttonId + " -- " + tooltip + "\r\n");
			//var doc = gBrowser.selectedBrowser.contentDocument;
		
			var button = doc.createElement("button");
			button.setAttribute("data-button-listener", "");
			button.setAttribute("data-tooltip-timer", "271");
			button.setAttribute("class", "end flip yt-uix-button yt-uix-button-default yt-uix-button-empty");
			button.setAttribute("data-tooltip", tooltip);
			button.setAttribute("style", "margin-left: 20px; border: solid;	border-right-width: 1px;	border-left-width: 1px;	border-top-width: 1px;	border-bottom-width: 1px;  border-color: #999;");
			button.setAttribute("type", "button");
			button.setAttribute("id", buttonId);

			var imageUrl = EXT_IMAGES["fvd"];
			var span_img = doc.createElement("span");
			span_img.setAttribute("class", "yt-uix-button-content yt-uix-button-icon-wrapper");
			var img = doc.createElement("img");
			img.setAttribute("align", "left");
			img.setAttribute("src", imageUrl);
			span_img.appendChild(img);
			button.appendChild(span_img);
	
			var span_title = doc.createElement("span");
			span_title.setAttribute("style", "padding-left:5px;line-height:23px; padding-right:10px; border: solid; border-right-width:1px; border-left-width:0px; border-top-width:0px; border-bottom-width:0px;");
			span_title.textContent = this.BUTTON_TITLE;
			button.appendChild(span_title);
	
			var img = doc.createElement("img");
			img.setAttribute("class", "yt-uix-button-arrow yt-uix-button-icon-wrapper");
			img.setAttribute("style", "margin-left:10px;" );
			img.setAttribute("id","yt_btn");
			img.setAttribute("src","//s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif");
			button.appendChild(img);
	
			var ul = doc.createElement("ul");
			ul.setAttribute("class", "yt-uix-button-menu");
			ul.setAttribute("style","display:none");
			ul.setAttribute("id", "fvd-yt-uix-button-menu");
			button.appendChild(ul);
	
			return button;
		}
		
		// -------------------------------------------------------------------------------------------
		this.buildMediaList = function( media, button, buttonId )  {

			var doc = gBrowser.selectedBrowser.contentDocument;
			var location = gBrowser.webNavigation.currentURI;

			var menu = doc.getElementById( "fvd-yt-uix-button-menu" );
			if(menu != null)
			{
				while( menu.firstChild )
				{
					menu.removeChild( menu.firstChild );
				}
			}
			else
			{
				menu = doc.createElement( "ul" );
				menu.setAttribute( "class", "yt-uix-button-menu" );
				menu.setAttribute("id", "fvd-yt-uix-button-menu");
				button.appendChild(menu);
			}
			
			var media_fullHD = false;
			
			for( var k in media ) {
				var m = media[k];	
				
				if ( ! fvd_single.check_shows_format( m.ext, location.spec ) ) continue;
				
				if ( ! fvd_single.check_shows_type( m.yt_type, location.spec ) ) continue;
				
				if( "yt_type" in m && (m.yt_type == 'full_hd' || m.yt_type == 'ultra_hd') ){
					media_fullHD = true;
				}	
				else {
					this.createVideo( menu, m );
				}
					
			}
			
			if (media_fullHD)	{

				for( var k in media ) {
					var m = media[k];	
				
					if ( ! fvd_single.check_shows_format( m.ext, location.spec ) ) continue;
					
					if ( ! fvd_single.check_shows_type( m.yt_type, location.spec ) ) continue;
					
					if( "yt_type" in m && (m.yt_type == 'full_hd' || m.yt_type == 'ultra_hd') ){
						this.createFullHD( menu, m );
					}
				}
			
			}

			this.createSetLi( menu, 'formats' );
			this.createSetLi( menu, 'folder' );
			if (fvd_single.check_like_status( )) this.createSetLi( menu, 'rating' );
			this.createSetLi( menu, 'betterfox' );
			this.createSetLi( menu, 'nimbus' );
		
		}

		// -------------------------------------------------------------------------------------------
		this.createVideo = function( menu, media )  {

			var imageUrl = "";
			if( "ext" in media && media.ext in EXT_IMAGES  )	imageUrl = EXT_IMAGES[media.ext];

			var li = doc.createElement("li");
			var span = doc.createElement( "span" );
			span.setAttribute( "class", "yt-uix-button-menu-item" );

			var img = doc.createElement("img");
			img.setAttribute("align","left");
			img.setAttribute("style","margin-top: 5px");
			img.setAttribute("src", imageUrl);
			span.appendChild(img);

			var span_t = doc.createElement("span");
			span_t.setAttribute( "style", "margin-left: 10px;" );
			span_t.textContent = media.raw_file_ext + " " + media.ext;
			span.appendChild(span_t);

			(function( medToDownload, span ){
						span.addEventListener("click", function(){
										try
										{
											fvd_single.downloadInstance.downloadByWindow( 	medToDownload.url, 
																							medToDownload.download_name ? medToDownload.download_name : medToDownload.file_title,
																							"." + medToDownload.ext, 
																							medToDownload.referer, 
																							function( downloadId ){	}	
																						);																					
										}
										catch( ex )
										{
											dump( "YT_BUTTON: ERROR WHILE START DOWNLOAD: " + ex + "\n" );
										}
									}, true);
					})( media, span );

			li.appendChild( span );	
												
			menu.appendChild( li );					

		}	
		// -------------------------------------------------------------------------------------------
		this.createFullHD = function( menu, media )  {

			var doc = gBrowser.selectedBrowser.contentDocument;
			
			var li = doc.createElement("li");
			var span = doc.createElement( "span" );
			span.setAttribute( "class", "yt-uix-button-menu-item" );
	
			var imageUrl = EXT_IMAGES["hd1080"];
			span.setAttribute( "style", "border: solid;	border-right-width: 0px;	border-left-width: 0px;	border-top-width: 1px;	border-bottom-width: 0px;  border-color: #999;" );
	
			var img = doc.createElement("img");
			img.setAttribute("align","left");
			img.setAttribute("style","margin-top: 5px");
			img.setAttribute("src", imageUrl);
			span.appendChild(img);
		
			var span_t = doc.createElement("span");
			span_t.setAttribute( "style", "margin-left: 10px;" );
			span_t.textContent = (media.yt_type == 'full_hd' ? 'Full HD Video' : 'Ultra HD (4K) Video');
			span.appendChild(span_t);
			span.addEventListener("click", function( event ){
			
/* 												if (self.message_ffmpeg)  {
													fvd_single.downloadInstance.download_media_HD =  {   
																								yt_id: media.yt_id,
																								video_url: media.url, 
																								audio_url: media.ext_url, 
																								name:	media.download_name ? media.download_name : media.file_title,
																								ext: "." + media.ext, 
																								referer: media.referer 
																							};
													fvd_single.observer.notifyObservers(null, 'FVD.Single-Media-Rkm', 'ffmpeg');
													self.message_ffmpeg = false;
												}	
												else	{ */
													self.download_FullHD( 	
																		media.yt_id,
																		media.url, 
																		media.ext_url, 
																		media.download_name ? media.download_name : media.file_title,
																		"." + media.ext, 
																		media.referer,
																		function( downloadId ){	} 
																	);
												// }					
											});

			li.appendChild( span );	
			menu.appendChild( li );					
		}
		
		// -------------------------------------------------------------------------------------------
		this.download_FullHD = function( yt_id, video_url, audio_url, name, ext, referer  )  {

			try
			{
				fvd_single.downloadInstance.downloadByWindowFullHD( yt_id, video_url, audio_url, name, ext, referer,
																		function( id_video, id_audio, dir_path, file_name, file_ext ) {
				
																			if( id_video ) {
					
																				var ff = fvd_single.downloadFullHD;
																				ff.push({ 	url: video_url, 
																						video_id: id_video, 
																						audio_id: id_audio, 
																						video_state: false, 
																						audio_state: false,
																						name: name,
																						path: dir_path,
																						file: file_name,
																						ext: file_ext
																					});
																			}	
																		});
			}
			catch( ex )
			{
				dump( "YT_BUTTON: ERROR WHILE START DOWNLOAD: " + ex + "\n" );
			}

		}	
		
		// -------------------------------------------------------------------------------------------
		this.createSetLi = function( menu, type )  {
	
			var doc = gBrowser.selectedBrowser.contentDocument;
			
			var li = doc.createElement("li");
			var span = doc.createElement( "span" );
			span.setAttribute( "class", "yt-uix-button-menu-item" );
	
			if (type == 'formats')
			{
				var imageUrl = EXT_IMAGES["set"];
				span.setAttribute( "style", "border: solid;	border-right-width: 0px;	border-left-width: 0px;	border-top-width: 1px;	border-bottom-width: 0px;  border-color: #999;" );
	
				var img = doc.createElement("img");
				img.setAttribute("align","left");
				img.setAttribute("style","margin-top: 5px");
				img.setAttribute("src", imageUrl);
				span.appendChild(img);
		
				var span_t = doc.createElement("span");
				span_t.setAttribute( "style", "margin-left: 10px;" );
				span_t.textContent = this.BUTTON_FORMATS_TITLE;
				span.appendChild(span_t);

	
				(function( span ){
							span.addEventListener("click", function( event ){
										//menu.setAttribute("style","display:none");
										fvd_single.set_file_types( event );
									}, true);
						})( span );
			}
			else if (type == 'folder')
			{
				var imageUrl = EXT_IMAGES["set"];
				span.setAttribute( "style", "border: solid;	border-right-width: 0px;	border-left-width: 0px;	border-top-width: 0px;	border-bottom-width: 0px;  border-color: #999;" );

				var img = doc.createElement("img");
				img.setAttribute("align","left");
				img.setAttribute("style","margin-top: 5px");
				img.setAttribute("src", imageUrl);
				span.appendChild(img);
		
				var span_t = doc.createElement("span");
				span_t.setAttribute( "style", "margin-left: 10px;" );
				span_t.textContent = this.BUTTON_FOLDER_TITLE;
				span.appendChild(span_t);
		
				(function( span ){
							span.addEventListener("click", function( event ){
										fvd_single.set_default_folder( event );
									}, true);
						})( span );
			}
			else if (type == 'rating')
			{
				var imageUrl = EXT_IMAGES["like"];
				span.setAttribute( "style", "border: solid;	border-right-width: 0px;	border-left-width: 0px;	border-top-width: 0px;	border-bottom-width: 0px;  border-color: #999;" );

				var img = doc.createElement("img");
				img.setAttribute("align","left");
				img.setAttribute("style","margin-top: 5px");
				img.setAttribute("src", imageUrl);
				span.appendChild(img);
		
				var span_t = doc.createElement("span");
				span_t.setAttribute( "style", "margin-left: 10px;" );
				span_t.textContent = this.BUTTON_RATING_TITLE;
				span.appendChild(span_t);
		
		
				(function( span ){
							span.addEventListener("click", function(){
										fvd_single.give_us_rating();
									}, true);
						})( span );
			}
			else if (type == 'betterfox')
			{
				var imageUrl = EXT_IMAGES["bet"];
				span.setAttribute( "style", "border: solid;	border-right-width: 0px;	border-left-width: 0px;	border-top-width: 0px;	border-bottom-width: 0px;  border-color: #999;" );

				var img = doc.createElement("img");
				img.setAttribute("align","left");
				img.setAttribute("style","margin-top: 5px");
				img.setAttribute("src", imageUrl);
				span.appendChild(img);
		
				var span_t = doc.createElement("span");
				span_t.setAttribute( "style", "margin-left: 10px;" );
				span_t.textContent = 'Make your Firefox 15% faster!';
				span.appendChild(span_t);
		
				(function( span ){
							span.addEventListener("click", function(){
										fvd_single.navigate_url( 'https://addons.mozilla.org/En-us/firefox/addon/betterfox/' );
									}, true);
						})( span );
			}
			else if (type == 'nimbus')
			{
				var imageUrl = EXT_IMAGES["nim"];
				span.setAttribute( "style", "border: solid;	border-right-width: 0px;	border-left-width: 0px;	border-top-width: 0px;	border-bottom-width: 0px;  border-color: #999;" );

				var img = doc.createElement("img");
				img.setAttribute("align","left");
				img.setAttribute("style","margin-top: 5px");
				img.setAttribute("src", imageUrl);
				span.appendChild(img);
		
				var span_t = doc.createElement("span");
				span_t.setAttribute( "style", "margin-left: 10px;" );
				span_t.textContent = 'Make Screenshot, Edit, Upload';
				span.appendChild(span_t);
		
				(function( span ){
							span.addEventListener("click", function(){
										fvd_single.navigate_url( 'https://addons.mozilla.org/en-US/firefox/addon/nimbus-Screenshot/' );
									}, true);
						})( span );
			}
			li.appendChild( span );	
			menu.appendChild( li );					
		}
	
		
// ================================================================================================
	}	
})();

