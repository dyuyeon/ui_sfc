window.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 가져오기 ---
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const imageLoader = document.getElementById('imageLoader');
    const imageXSlider = document.getElementById('imageX');
    const imageYSlider = document.getElementById('imageY');
    const imageScaleSlider = document.getElementById('imageScale');
    const resetImageBtn = document.getElementById('resetImage');

    const textTitleInput = document.getElementById('textTitle');

    const downloadBtn = document.getElementById('downloadBtn');

    const frameImage = new Image();
    frameImage.src = 'frame.png';
    frameImage.onload = () => renderCanvas();



    // --- 상태 관리 객체 ---
    const state = {
        image: null,
        imageX: 0,
        imageY: 0,
        imageScale: 1
    };

    // --- 폰트 미리 로드 보장 ---
    const sbFont = new FontFace('SB Bold', 'url("./SB Bold.otf")');
    sbFont.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
        renderCanvas();
    }).catch(console.error);

    // --- 캔버스 렌더링 함수 ---
    function renderCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 배경 투명화
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 초기화

        // 사진 렌더링
        ctx.save();
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        if (state.image) {
            ctx.save();
            const imgCenterX = centerX + state.imageX;
            const imgCenterY = centerY + state.imageY;
            ctx.translate(imgCenterX, imgCenterY);
            ctx.scale(state.imageScale, state.imageScale);
            ctx.drawImage(state.image, -state.image.width / 2, -state.image.height / 2);
            ctx.restore();


        } else {
            ctx.fillStyle = '#777';
            ctx.font = 'bold 30px Noto Sans KR';
            ctx.textAlign = 'center';
            ctx.fillText('사진을 업로드 해주세요', centerX, centerY);

        }
        ctx.restore();

        // 1. 프레임 이미지 덮어서 그리기
        if (frameImage.complete) {
            ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
        }



        // 4. 제목 텍스트 (기울어진 검은 박스 + 텍스트) 그리기
        // 입력값이 없으면 "큰모임 #1"을 옅은 회색으로, 값이 있으면 입력값을 흰색으로 표시
        const isPlaceholder = !state.textTitle;
        const displayTitle = isPlaceholder ? '큰모임 #1' : state.textTitle;

        ctx.save();

        // 텍스트 설정
        const fontSize = 120; // 필요에 따라 폰트 크기 조절
        ctx.font = `bold ${fontSize}px SB Bold`; // Pretendard 폰트 적용

        // 텍스트 너비 측정
        const textMetrics = ctx.measureText(displayTitle);
        const textWidth = textMetrics.width;

        // 박스 크기 및 여백
        const paddingX = 43;
        const paddingY = 40;
        const boxWidth = textWidth + paddingX * 2;
        const boxHeight = fontSize + paddingY * 2;

        // 박스의 기준점 위치 (frame.png 의 '우이센터' 아래 위치에 맞게 조절 필요)
        // 임시로 우측 상단 쯤으로 설정 (x, y 값은 나중에 시각적으로 확인하며 조정해야 함)
        // 우이센터 텍스트 박스와 겹치기 위한 기준 좌표 (시작점)
        const startX = 1028; // 우측 여백
        const startY = 1006; // 상단 여백 (우이센터 박스 아래)

        // 기울기 설정 (왼쪽으로 살짝 기울어짐 (반시계방향))
        const angle = 354 * Math.PI / 180; // 354도 (-6도)

        // 캔버스 회전의 기준점을 우측(텍스트 끝나는 부분)으로 이동 후 회전
        ctx.translate(startX, startY);
        ctx.rotate(angle);

        // 배경 검은색 박스 그리기
        // 박스가 왼쪽으로 길어져야 하므로, x좌표를 음수방향으로 그리거나 끝점을 startX로 둠
        ctx.fillStyle = 'black';
        ctx.fillRect(-boxWidth, 0, boxWidth, boxHeight);

        // 텍스트 그리기 (값이 없으면 회색, 있으면 흰색)
        ctx.fillStyle = 'white';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        // 텍스트 위치 보정 
        ctx.fillText(displayTitle, -paddingX, paddingY + 5);

        ctx.restore();
    }

    // --- 이벤트 리스너 설정 ---

    // 이미지 로더
    imageLoader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                state.image = img;
                renderCanvas();
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });

    // 이미지 컨트롤
    [imageXSlider, imageYSlider, imageScaleSlider].forEach(slider => {
        slider.addEventListener('input', (e) => {
            state[e.target.id] = (e.target.id === 'imageScale') ? parseFloat(e.target.value) : parseInt(e.target.value);
            renderCanvas();
        });
    });

    resetImageBtn.addEventListener('click', () => {
        imageXSlider.value = 0;
        imageYSlider.value = 0;
        imageScaleSlider.value = 1;
        state.imageX = 0;
        state.imageY = 0;
        state.imageScale = 1;
        renderCanvas();
    });

    // --- 초기 렌더링 ---
    renderCanvas();


    // 텍스트 입력
    textTitleInput.addEventListener('input', (e) => {
        state.textTitle = e.target.value;
        renderCanvas();
    });



    // 다운로드 버튼
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        const fileNameTitle = state.textTitle ? state.textTitle : '제목없음';
        link.download = `uisfc_insta26_${fileNameTitle}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });


    renderCanvas();
});