const archipelago_icon = {type: "png", palette: "closest", 
    data: "iVBORw0KGgoAAAANSUhEUgAAABQAAAAVCAYAAABG1c6oAAAUlXpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjapZpZdhs7e0XfMYoMAX0zHLRrZQYZfvZBkbqWLNn/TSyLpIpFFPA1p0HR7P/572P+i38pxmxiKjW3nC3/YovNd15U+/zr99HZeB+fP+LrPff5uHHp9YbnUOA5PH/W/Dr/fdx9DPA8dV6lXwaq8/XG+PxGe13Z1y8DvS4UNCPPi/UaqL0GCv554z31/izL5lbLr0sY+3l+ff4JA79GD6HcsT8G+fp3LERvJQ4G73dwwfIYwmsCQb/RhM6LwKMPQSdymo5UHlNwr5kQkO/i9PGvMaOjqcZvT/qUlRO+z9b7lfmarehfp4QvQc4fz98eV/q/zcoN/S9XjvX1yn8+fooLz4y+RF+/56x67ppZRY+ZUOfXot5Lua84b3AJDVQNU8u28JsYotyfxk+lqidZW3bawc90zXmufVx0y3V33L7P002mGP02vvDC+0m6dLCG4puf5M2FqB93fAktLPLow7xpj8F/zMXdyzY7zb1a5crLcap3DOb4yL/+Mf/2A+eoFZyzr+BTFszLewWbaShzeuQ0MuLOK6jpBvj98/Wf8hrIYFKU1SKNwI5niJHcP0gQbqIDJyaen3ZxZb0GIERcOjEZF8gAWXMhuexs8b44RyArCepMnQbygwy4lPxikj6GkMlN9bo0HynunuqT57DhOGBGJlLIoZCbFjrJijFRPyVWaqinkGJKKaeSamqp55BjTjnnkgWKvYQSTUkll1JqaaXXUGNNNddSa221N98CoJlabqXV1lrvXLMzcufTnRN6H36EEUcyI48y6mijT8pnxplmnmXW2WZffoUFfqy8yqqrrb7dppR23GnnXXbdbfdDqZ1gTjzp5FNOPe30j6y5V9t+/fkXWXOvrPmbKZ1YPrLG0VLeQzjBSVLOSJg30ZHxohRQ0F45s9XF6JU55cw2EC8kzySTcracMkYG43Y+HffOnfFPRpW5/1feTImf8ub/r5kzSt2/zNzvefsua0s0NG/Gni5UUG2g+3h/1+5rF9n99myeF6OnkQ6DxVrOHo0Rfd+5jyUqOjZygRPLcIPRgJy28xqz+LwEV3X2anjcu7cWBohHYGLXm7Vtm89pds11mE3az3N3fpVuUwkHlKw5nOHySXsXsxm95F3nLKMQkkFkLJg424l9V8JYRttj2co7fs5nNTF3FxP/xaL32VAeNW0BFjznqBeWJlzS1fvKeyW3comLFeXlO6s7gQvykM88o5QcCOmJZhKXTjGGuGbqsdS5ckq7nFlWONudSaCCBt4uTT0vlJCeKUelYHhG3cc4v9s4q4Xt7ejP9QjSyEXXI8PIkRNZaOorhTihj7F8gywKNe/7XWkPzUT/c0r/+jxGPpWJMTNDJ2nGq7RBdKj32MZAc7QZyHEPa26fxzpjhps3mGu39GSy2LvkSvlEw9zmTl6ZISB27ZmI4KhKBbEvAPbNi/35udR2qjnjbNptRSK72nOFkfrJFJmP98pMs9/k8MGTh9tpQOk0S+W0eNxNAVnTmvQy3wMnZmqurpV7W/N4PwD+nLw+/SqinP2XIuLZvF6kNQ79esAADWep0kO/g3Yr7BlO9mTy7LTOXATs3AKg4SvtfcoGs5kvJV32PBRLCLcU11DgV+oTBQCIXCQpBeXc955T5aUL7Z4RLbPfQY2C8fkdmr+/F0sQDlmmjPqmDDfV7NwoPhIaUlazFgAkhWOOb+eZhb+DPO/RIHpX6b5/IT4I1gBGAthA9ilimHY2B3zdeZivU9QMCTJsMB1gUiPNHRrIRZ2PvQJFEhxxIXlz5tTiLmGQJkREod7i+1rjuRYI7evYOY02OWtC8AcIvCXZRDl02FytcBnyWaIQMoxUwaS5Rz0zj1EBtK15hk1I+GAhoW1R8gMZQGmlTNmFfpIbKzWUWQKWssm1htPUFotUggApdtA5sfDAJZkEAFBXJrmFNYbiBhzt28jg+Kv+pSjMb5W1Y6JPnAB0hQzM3tAvF9uGFhYUmpfz5ekCABgo6HlCR22tnXNgBnMl2MWVTcB2aQnPBT5R5cy0dMCNsYe6Its9CHqn1rhC3yHeYIP6oBFYeBYfL2M4LNZa6LzlRyW+NQXCC1LeGmt8ShFdMXNZMLD73QtNi+MY/EUOezqoqzloBVYItFDNsEm69TTCrdvvjnON7k2jPtSe9ZBP0UHjrOkbl+91XzSIT4WB3D++k7ZBrCW3F7MDpt5jedj4WH4lovqYYysctCJxtIGI84JVE/nYJnx/3DI00vbU/j7uMsmsHeYm7aIBro3FOpw8OtehdcGCHEawK7E0+KK9KmAZKybNVtVL47r8EFEe8b6a1lUCXRtUArhVGDk3tzMYk3NriBFJgED1mxGipW8o6uIAPasnVajYOkEoAxDfEg8pW6Gahxx/g7VE045SXSUoDoYNs3m6DEGUXBGiQ0oZurUhjYhOCQttF5J9Aqy6nzQPM16nGxEC4ZzINRoFvkNVt7HhA4qLuKNVfEcKOXCtW3ispfrYPWauKpoUEoWBYiuqivSU/Imed1mWOhiAStSXfy2pPkvKMKbf0Vb+JuLMf0tvmVbmAKEqay27xTluZSSgAowKCDbgAH2Cjtw0LJ2eKIQsUQZi0Xxc28URk6woZlIR3S+SAPm+BDN4mhC+9KV2YghVl4R8qmgPlOiW2xhG/HghNpLyR4VYn0E3HUOf3OeUO0MCBiM75peBxlscxKHf0C/MMWX1VEx8gJ85rcjMKJYFbfcEae9H8x34qr+qgIh/ejZfD5BriCo9eskyjHQBBXiQWishkxFfJ7ucRUzgpoXCwHT0UUaSw8NjRhRwXja35UYMGRusJRCgilnktNOTUGk4jPeirAoCakZkJOcVb9YNKNJ/3egfbZUEeTLcLdkHwBLNS74op7mLTob4UZyt1VnsCkrW2M3QEbbAcQmJRpnGu91T7k6CVMKOyNQB/SD/EW65kf+QFtL8SSmq6McY/RazMe6rgXQDA344y3w94Ab5olVmisH1NJOqXuK7euaxpFxREwjn+xal+3rT3FkCFANrC5jOGIs7T9yGp/ZpXDB6LMALMcJB7E2+BQMhQFkwdN9LwcY8oJrKBPwPPS4+TS+0QraH+lfB9jyb9wu3FtylS4IFFZJHTFD16GiSEguptzPTrHu5pbLMaEQFDgYYSDPUyEAhbBQFcBpYLfYPpXC2RJt41t9mgYBLjAEZiF6cAcHTYNC+ADxQLdFlBrTIVIowysF+Ipj9CHLJ5z8MnB54yxxo4LFZyLLBuOuOq2HLH4cN3w/rDKJ/0Y4bJMZtsH60thj7h1XymQCLD3ICLuIIpdH1jtFbjtHOx2j+jkZVTUwICmZQyB6mF+w0PCmg1/wGreqsbtVrLmI3qHuqv+BRJyWSiVfGXGKv7Jgv82KxqZTSeCEPDYg2gwhrE113lHBBjVBvgHZxU1FZRAyHTzGADHXj1ByNmbu0DdkGnLDjV+7kG9T4IJh2sQwRLKs8FDNoyid46yIjQhrbfpHpPN4AR3pnCXirnAcEJZ6ngAwEPF6Avy/ge6CDa23AOOiUdO0fwb1eXKiVIP04a8VEggGDgsphmQoWrTQbEcX2gXlQAZISrndCLhTjrXwoONKtHu9UckSySNptyKejn7EXRe4ISRRgOQRXhx45jBRCnUhNJwz0PRN98Jy3InJ6kQboGG3VH4E/s7wIy0E3I26e09/n/TwYfwbsm5gUKTt9ovIMevieiFrxVDxsiPxFY9etI0zdoXfe8kFo2RH0Wf4GHJrkR+2MlzWooYeGqNBbvxLXkNfY0P3wkiwIrVomYpRaDfUwDDKb+qAMS8AbIlnHMDAmEiZVPUI/6IdVylWH4SW9FloI636wftAzAhUZrNnS//alsjx49IFPkehslKR0zUCJUOGBWQckqtUqauIVJgmqQGokYBGx17sbre21phkTrsXkOFd9cgjeWTD4IBPCqL9mdhT0IpcCaGkrB8yF0sgwUebDIOI2uCutjILrSl59vKH3/voHgn0Hox9kUOm4slkv15bt7YEO2pzK4kyIQ7I7pYyk1+2CHKCUjIDKF2uczXjlrs1oPohyQtZH3xc1TocWHKqvGTdo8PcOlqsecQYtEMNtc4q3VspwSioWMDw7DifSGqx4u6WoHVzIYxoTeMQCT9qHBQeX6DIMUqNF4Fk8NgEEMrOcIhzrwNQgVAL8+nk6nwURDWQNBvHR18DVZQDQaOGNaD58MeUEvcT7B8KqF2zR0WZLkf7zhZXaiOwozmDCKFjQCIu0EbXZz1lYLFqT1aJooY8h3ra9413AI36Yd660KtjEslHaczKQv7RK649v9gW6kKw3igKUBTmaFYRX9MduqjkqZaFs3DZVapMyo+cLoyN2RbtQBhqoigfwilWCExkiaPdUtTBeFhM80f6k5oEXqfU/3ejB2S/Uj8PeJBqOTxdnV83owoQYVWFibDC0tAaNfqivunrDO0IGS5WZKULU0aQS2gQjyC9ro3pC3aBwRA8ujB/8DoA+e2xFQmOrcfV3tKVvio8VRvE+DgVXoK0avx7JNE+Ifm1Ut8n0csfJEYOQg9N+VPAbJs6bgpgWf+4j/IXdumIGY5rP9s9mopUtjXTd9bSXIa1mEgsqJFyPd/eRelGxgWPOklt0CVIPwY19w9RS2i50zQPf5axBz7LeCiKMxuPUPCtz0502nAWgFb0f/WIkyDb8cIhi+Pado5eYNL8WzffPJYQnxR0LkX86y/xyIDY7nU/I/VixyCpu2cHHTWcW8UCybtaQ0lOhLjIRqcHlmyGYix5Y2lQFVjLut3pYGNjbPmM+aRk8ScB39bJyB8vTdhUqTnUUCG3goLFRhiDa7WBGUBDjFyESrw3sjODGVGIA0BPYwq57mvviGyolCR8LjqHBulBd3iyN5m1SjnsH7TKQXlre/Zre+SGnriLojIU4OtE+SqE1wNQcdRreC925OgSvnSvIEV7EQmC3BPZ2Y61VaqwtoOdaKsEBU5yF3BIh1mCmyz50RDZ2hiZucoNyo91r3E1/Kf0ZIXrwO77N6LBzwUqHh9jlPnHDs2GOgVVSQjTbTWDe8T/V1oiqdYlt12bIwJ9OZ1hHtmSXpzR2Tq1Z54vsATVfAjCJm0Wx9UgAsAg0fF0WPsF/QcU93h1teXoKEhvMcWDMsl6H58OQRKk7OuBupPQDi4AfgF5B8B+0JT4fZm7LVwTZIx5Gi+/d1V9Aqgkll0dYQ6VtmhZhdmaJoVy1qlH3jTnwI74Hmn13oOPEOc7ZZuruGQvhG3+/nfHlchDBm8eO/WYy0WKctF+DRjiUaQzFkNg04Mp8bzpsorKBcypP7hMuE4s8ezgHDc6xoV1CBaONMChMOKrj/k2iKHx84Z0Mwt8Mpe0ZGU8mA8SKJplULI1gkLvNKT6UI8XY0Lb97VOr+2MFoQUPnfbIDCMlP+9Lq+23mTvxXHIo5y5o+LSmw7MFN0A/fD6TOHFulrrkIm3XDuU0NNJ1cPxv9Z8LJ8l7xHDfruWYQJKqu1UUH41wdruXpiiRihuPmr0Z7bi8JjyB6MgzUKDMCVAsmzYEy8K8cgH5ThEkGs/3rq92BCvyhujQ9OhUTM1YOwvHZka1bTTzA5rM4+8958kqNQmmmRYqkrdAFAvqg7ZAKcAkTuh0WNSHhykGJoCwfNzlWGiyXwYF/5KBK7HySYGgiOEb7c0USTcIEd1i+3NDjKWfJykIgSnWOvrSh6Q05m11kwa6WApBu55Rd50ebKSVL/5VMnafBRgLzhQtEA+qXjfY7nsoNLns/NpzXdqZy6gAoCHRwfYAH2Gj1qLFi6GBl1xiqAsGRnTj4Vufsm9oSk+MsBcNCkTr6dbLQ8Y14Q6nPPKQVVhHToz2rcL0b96iILf8mWSvML45hB+Kp7RnX9TPBkrLGqposX3jKYV0t38/vWmed9WSvIvFa+AQLRe7ys49ZafdkafsxizapMa7jSc6cuY0uGTNVRgwifbM0eTjzgV54bQfA93HIFHbsVSx2hlR3DsGkrEB0HixVvp9G91nFtg5pErStgqVNLRreTeNy8eG09+2mcz7BVgVCi4buxa1QQAhg+EwIcnsjUSAcSGGEejqDraHVjAkbTrEGOCBF8ESatUo56rIqbMfx40TY4HYaaQqVgmxWihVOq4Ph0dBUecuENM9JZfNjwPcxKxNrO4m8VZ9lt1F4p6AyhnEOQi6vYVjOul6KofmRYrCwuHKNkRK07bB3QK4Rv2Vp9Kzyqc/UFJvBc5owjNmKtpWuAYLlgvPPkAIr1uJOI+mvBbttoPRW5aygFkwvHbxAR6jbx7EuBOhRsVm3etimYowRmz4jquAMe6eZAYH3opvzvn5xqz5lWYGKFdTwT1qD4mj0BJRGFVqOGSgxe3S9FWmorFzJGhWW3gzaBsas3bkCCFCD55AoSdqpwiP8g8W7K9YkOFKPwuuv+l7RN6ouWvHiS1VrA0IWVu1L8GF0N9YBv+OXa6vW/bBausRY7kR30g3/BWCHSsTWRQSonNmfrH93O3vBAcAYNWGfBVeRHswXXdAs20LzunYvQ2ctnK/b2QbFUbYuRh9fupz+9knG173jrRH3qVqmSGWKumLGE0zkrTA8Jyonc6AjsB4SwCumBceBYWpO6hFN+BxiEnOT8RlSC5IwVVx0zPke8t8M7XE4HiDIhWoe11viUNgv12r8X/fPrYQypEXy0mR3JXiWKODLygSJiY4H0ZfEbicUSjXw9XQKU+NN9Spvv9RsOFb32nqk0xT1cQM+YSoXT7MUOCeMZfJAbtDc24fqktIXMgFAUCBb0bfVyhKbuqrEukP39swxaYYJYrDcj2uQQ09UIYI/Z1ZceLIj4rZR8kOJNSw+joVwTTSNzbivStqAoaRhwKGKzyxqbWhe5C3/vKIO4C38CoNM3e6MGZBp3O/XPHcKims9eGHtLP20OGqtLQls0pBmYNgE/mKv9EXkXAYutlesG80FstHKRlWPZ7gPt8WWdL0nIJz9ssezWHfqfg379v3BtQnVWE+CzGSpG9b/i/SH3NKVdOzBQAAAYRpQ0NQSUNDIHByb2ZpbGUAAHicfZE9SMNAHMVfU7UqFQcLijhkqE5WREUctQpFqBBqhVYdTC79giYNSYqLo+BacPBjserg4qyrg6sgCH6AODs4KbpIif9LCi1iPTjux7t7j7t3gFAtMs1qGwc03TYTsaiYSq+KgVf40Y8udGBMZpYxJ0lxtBxf9/Dx9S7Cs1qf+3P0qBmLAT6ReJYZpk28QTy9aRuc94lDLC+rxOfEoyZdkPiR64rHb5xzLgs8M2QmE/PEIWIx18RKE7O8qRFPEYdVTad8IeWxynmLs1Yss/o9+QuDGX1lmes0hxDDIpYgQYSCMgoowkaEVp0UCwnaj7bwD7p+iVwKuQpg5FhACRpk1w/+B7+7tbKTE15SMAq0vzjOxzAQ2AVqFcf5Pnac2gngfwau9Ia/VAVmPkmvNLTwEdC7DVxcNzRlD7jcAQaeDNmUXclPU8hmgfcz+qY00HcLdK95vdX3cfoAJKmr+A1wcAiM5Ch7vcW7O5t7+/dMvb8fTYhymAeARbEAABFAaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA0LjQuMC1FeGl2MiI+CiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIKICAgIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICB4bXBNTTpEb2N1bWVudElEPSJnaW1wOmRvY2lkOmdpbXA6NDlmNzJjY2UtNjFmNi00YTYxLWI3ODctOGM4YzI3Zjc3ZGU1IgogICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmJmYWFkNTE0LTA2YzUtNGU3Ny1hMDRkLTJhMzg5OWM2ZjY5OSIKICAgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmZmYmE4ZjIxLWJlNTQtNGViOS04NmQ2LThiNTViMjRjZmVmZSIKICAgZGM6Rm9ybWF0PSJpbWFnZS9wbmciCiAgIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIyMDM0IgogICBleGlmOlBpeGVsWURpbWVuc2lvbj0iMjExMiIKICAgR0lNUDpBUEk9IjIuMCIKICAgR0lNUDpQbGF0Zm9ybT0iTGludXgiCiAgIEdJTVA6VGltZVN0YW1wPSIxNzExMTg0OTM1OTQyNTk3IgogICBHSU1QOlZlcnNpb249IjIuMTAuMzAiCiAgIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiCiAgIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIKICAgdGlmZjpJbWFnZUxlbmd0aD0iMjExMiIKICAgdGlmZjpJbWFnZVdpZHRoPSIyMDM0IgogICB0aWZmOk9yaWVudGF0aW9uPSIxIgogICB0aWZmOlJlc29sdXRpb25Vbml0PSIyIgogICB0aWZmOlhSZXNvbHV0aW9uPSI3Mi4wIgogICB0aWZmOllSZXNvbHV0aW9uPSI3Mi4wIgogICB4bXA6Q3JlYXRvclRvb2w9IkdJTVAgMi4xMCIKICAgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMi0wOC0xNlQxOToyMjowOC0wNDowMCIKICAgeG1wOk1vZGlmeURhdGU9IjIwMjItMDgtMTZUMTk6MjI6MDgtMDQ6MDAiPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJwcm9kdWNlZCIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWZmaW5pdHkgRGVzaWduZXIgMS4xMC4wIgogICAgICBzdEV2dDp3aGVuPSIyMDIyLTA4LTE2VDE5OjIyOjA4LTA0OjAwIi8+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjdlMzY0YTRkLTBjODItNGJjNi04MTIwLTNjMmVhMDk2MzY1ZiIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChMaW51eCkiCiAgICAgIHN0RXZ0OndoZW49IjIwMjQtMDMtMThUMTM6NDg6MTMrMTI6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZmY2YTkyZGItMTU3MC00MWI4LTlkMDYtY2QwNTU2N2VhZWVkIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKExpbnV4KSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyNC0wMy0yMlQyMDozMDo1NCsxMjowMCIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoyMjlmNjNhMy0xYjBjLTRmZjMtYWE0My1kNTYzZmYzOWVlZmUiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoTGludXgpIgogICAgICBzdEV2dDp3aGVuPSIyMDI0LTAzLTIzVDIxOjA4OjU1KzEyOjAwIi8+CiAgICA8L3JkZjpTZXE+CiAgIDwveG1wTU06SGlzdG9yeT4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/Pl1nZHsAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfoAxcJCDfDGDIxAAACuUlEQVQ4y5XUXWjVdRgH8M/vv2PTskaxmtIMt7QVu/EiFMtOzl2UGPQi1J1MQytRpHInGnWk7SZmb8NeDSqobiSwF1FQVmuTVusFL3Kyotk6RTpjYW242jqnC/+LdfifEz3wu/k+z/fL83t+398TlInPMu11yGINCvgQT6zozI6U4oQyYkvRh5qi1CmsWtGZ/S6JF5VpsDVBDBbg4f/scCzXlcZaXIBPRvvPHT77xZ9PYmsRZ89PS6ba+q+dvBU3YBKHdqd390EYy3VV4EVsLhpB7/Rk/q6Tr/7+CtbH2L5Dt4xvnZhT2I+bZtUW8DK2R9gSn+J5plNzo6cEj2IaU4K2iTmFZ4vEZm76ADbNCJaKe66+/5IzOIHj760d/xV3l6nfksLiMgVzo1RYiNOYnooKC+MZl4rFKYxgGM/haAimCgXLcB+aY5u0xnM6hT9wGHsLCsdQGYRVeBD5MJbrur7/qyu/+fjLSzfgNlTi6LzK/J4dGwbrL1u049N/eam3deX6r9cNR/loO26MX/nA9zW5Nz+vObY0ZLLdF+Eg0kXt/4Cmzvbm4dngwPO9S+Ifs6iovgfrIjySIAZX4YVMtjvMEgt4KUEMVmNnyGS7h3BNQkEOmzfW9fZFId94Hqo4fnZ8zc3Yi9oEzokIlyckTgdW31vfsyAK+ZMYOH/+Gq6af6QaTRhN4FVHGExItG2q71mG13DFLLwGr1fNP9KIxxJ4gxGeji0xExNVqal3sKvE8qjArhCm9+HcLDyPZ6LO9ub98faYjBMjd9QOBFxXxsCNF1/Yn4+dIBZ+aPm29Pv/vGAm210bL9LJjXW9B6KQ/wXzSghOFAqp6t8mmm6Pf85Hy7elfyy7YIfeePyD2OhJ8W5DS8ed/3fB7sSZBHwUmVKkkoINLR1D8QJ9Gz/H5y2sbGjp+LYU72+RVNM2cf7jrQAAAABJRU5ErkJggg=="
} as PngPixelData;
const archipelago_icon_ID = ui.imageManager.allocate(1)
ui.imageManager.setPixelData(archipelago_icon_ID.start, archipelago_icon);