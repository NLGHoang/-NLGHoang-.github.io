// 1. Render Songs
// 2. Scroll Top
// 3. Play / pause / seek
// 4. CD rotate
// 5. Next / prev
// 6. Random
// 7. Next / Repeat when ended
// 8. Active song
// 9. Scroll active song into view
// 10. Play song when click
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'HOANG_PLAYER';

const playing = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const progress = $('#progress');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');


const app = {
    arrSongs: [''],
    currentIndex: 0, // lấy ra chỉ mực đầu tiên của mảng
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Vậy Là Ta Mất Nhau',
            singer: 'Khải Đăng',
            path: './assets/music/song4-khaidang.mp3',
            image: './assets/image/song4.jpg'
        },
        {
            name: 'Gặp Nhưng Không Ở Lại',
            singer: 'Hiền Hồ',
            path: './assets/music/song2-hienho.mp3',
            image: './assets/image/song2.png'
        },
        {
            name: 'Anh Ở Đâu Đấy Anh',
            singer: 'Hương Giang',
            path: './assets/music/song3-huonggiang.mp3',
            image: './assets/image/song3.jpg'
        },
        {
            name: 'THE PLAYAH',
            singer: 'SooBin',
            path: './assets/music/song1-soobin.mp3',
            image: './assets/image/song1.jpg'
        },
        {
            name: 'LALISA',
            singer: 'LISA',
            path: './assets/music/song5-lalisa.mp3',
            image: './assets/image/song5.jpg'
        },
        {
            name: 'Tay Trái Chỉ Trăng',
            singer: 'Tát Đỉnh Đỉnh',
            path: './assets/music/song6-tatdinhdinh.mp3',
            image: './assets/image/song6.jpg'
        },
        {
            name: '笑看风云',
            singer: 'Uông Tiểu Mẫn',
            path: './assets/music/song7.mp3',
            image: './assets/image/song7.jpg'
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function () {
        const html = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
            `;
        });
        playlist.innerHTML = html.join('');
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        });
    },
    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity, //chạy vô hạn
        });
        cdThumbAnimate.pause();

        // Xử lý phóng to / Thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px': 0;
            cd.style.opacity = newCdWidth / cdWidth; // để mờ dần: lấy kích thước mới chia cho kích thước củ
        };

        // Xử lý khi click play 
        playBtn.onclick = function () {
            if(_this.isPlaying){
                audio.pause();
            }else{
                audio.play();
            }
        };

        // Khi song được play
        audio.onplay = function () {
            _this.isPlaying = true;
            playing.classList.add('playing');
            cdThumbAnimate.play();
        };
        // Khi song bị pause
        audio.onpause = function () {
            _this.isPlaying = false;
            playing.classList.remove('playing');
            cdThumbAnimate.pause();
        };

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
                // Xử lý thanh thời gian kéo dài từ đầu tới cuối
                progress.style.background = 'linear-gradient(to right, #ec1f55 0%, #ec1f55 ' + progressPercent + '%, #d3d3d3 ' + progressPercent + '%, #d3d3d3 100%)';
            }
        };

        // Xử lý khi tua song
        progress.oninput = function (e) {
            audio.pause();
            setTimeout(() => {
                audio.play();
            },300);
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        };

        // Khi next song
        nextBtn.onclick = function () {
            if(_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.activeSong();
           _this.scrollToActiveSong();
        };

        // Khi prev song
        prevBtn.onclick = function () {
            if(_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.activeSong();
            _this.scrollToActiveSong();
        };
        // Khi random song
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        };

        // Xử lý next song khi audio ended
        audio.onended = function () {
            if(_this.isRandom) {
                _this.endRandomSong();
                _this.loadCurrentSong();
                audio.play();
                _this.activeSong();
                _this.scrollToActiveSong();
            } else if (_this.isRepeat) {
                audio.play();
            } else {
                _this.nextSong();
                audio.play();
                _this.activeSong();
                _this.scrollToActiveSong();
            }
        };
        // Xử lý khi repeat lại song
        repeatBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        };

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            // e là event, target là mục đích đến mình bấm vào, closest trả về thằng cha or lớp con của nó miễn là trong thằng cha là được,
            // :not là loại trừ ra
            if(
                songNode ||
                e.target.closest('.option')
            ) {
                // Xử lý khi click vào song
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.activeSong();
                    _this.scrollToActiveSong();
                }

                // Xử lý chức năng option
                
            }
        };
    },
    loadCurrentSong: function () {
        // const songActive = $('.song.active');
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    // Xử lý active song không cần render lại songs
    activeSong: function(){
        var loopSongs = $$('.song');
        for (var song of loopSongs){
                song.classList.remove('active');
        }
        const activeSong = loopSongs[this.currentIndex];
        activeSong.classList.add('active');
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function () {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while(newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    // Khi đang random mà kết thúc song sẽ random sang bài khác
    endRandomSong: function () {
        this.arrSongs.push(this.currentIndex);
        if(this.arrSongs.length === this.songs.length){
            this.arrSongs = [];
        }
        let newIndex1;
        do {
            newIndex1 = Math.floor(Math.random() * this.songs.length);
        } while (this.arrSongs.includes(newIndex1));

        this.currentIndex = newIndex1;
    },
    scrollToActiveSong: function () {
        if(this.currentIndex === 0) {
            setTimeout(() => {
                document.documentElement.scrollTop = 0;
            }, 300);
        }
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }, 300);
    },
    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();
        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Lắng nghe /  xử lý các sự kiện (DOM events)
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // Hiển thị trạng thái ban đầu của button repeat & random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
};

app.start();