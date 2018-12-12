(function () {
    'use strict';

    var $body = $('body');
    var triggerClassName = 'timepicker';
    var triggerSelector = '.' + triggerClassName;

    var $triggers = $(triggerSelector);

    $body.on('applyTimepicker', function (event, $parent) {
        if ($parent && $parent.length) {
            if ($parent.hasClass(triggerClassName)) eachInput.call($parent[0]);
            else $parent.find(triggerSelector).each(eachTimepicker);
        } else $(triggerSelector).each(eachTimepicker);
    });

    $triggers.each(eachTimepicker);

    function eachTimepicker() {
        var $this = $(this);
        var $clock = $this.find('.timepicker_clock');
        var $clockHand = $clock.find('.timepicker_hand');
        var $timepicker_display = $this.find('.timepicker_display');
        var $time = $timepicker_display.find('.time');
        var $input = $timepicker_display.find('input');
        var $ampm = $timepicker_display.find('.am_pm');
        var $am = $ampm.find('> span:first-child');
        var $pm = $ampm.find('> span:last-child');
        var $ampmSelected;
        var currentAngle = 0;

        var hour = 0;
        var minutes = '00';

        var $ampmInitialSelection = $ampm.find('.selected');
        if ($ampmInitialSelection.length) {
            $ampmSelected = $ampmInitialSelection;
        } else {
            $ampmSelected = $ampm.find('span:first-child');
            $ampmSelected.addClass('selected');
        }

        $ampm.find('> span').on('click', function () {
            var $this = $(this);
            if (!$this.hasClass('selected')) {
                $ampmSelected.removeClass('selected');
                $this.addClass('selected');
                $ampmSelected = $this;
                $input.val(hour + ':' + minutes + $ampmSelected.text());
            }
        });

        var val = $input.val();

        if (val !== '') {
            setTime();
        }

        $input.on('change', function () {
            val = $input.val();
            setTime();
        });

        function setDisplay() {
            minutes = (minutes === 0) ? '00' : minutes;
            $time.text(hour + ':' + minutes);
        }

        function setTime() {
            var valTime = val.slice(0, -2);
            var valHour = parseInt(valTime.split(':')[0]);
            var valMins = parseInt(valTime.split(':')[1]);
            var meridiem = val.slice(-2);
            if (
                valHour <= 12 &&
                valMins <= 59 &&
                ((meridiem.toUpperCase() == 'AM') || (meridiem.toUpperCase() == 'PM'))
            ) {
                var quarterHour = Math.floor(valMins / 15) * 15;
                hour = valHour;
                minutes = quarterHour;
                setDisplay();
                if (meridiem.toUpperCase() == 'AM') {
                    $pm.removeClass('selected');
                    $am.addClass('selected');
                    $ampmSelected = $am;
                } else {
                    $am.removeClass('selected');
                    $pm.addClass('selected');
                    $ampmSelected = $pm;
                }

                currentAngle = (hour * 30) + (minutes / 2);
                $clockHand.css('transform', 'rotate(' + currentAngle + 'deg)');
            }
        }

        function roundAngle(angle) {
            return Math.round(angle / 7.5) * 7.5;
        }

        function angleToTime(angle) {
            var zeroHour = Math.floor(angle / 30);
            hour = (zeroHour == 0) ? 12 : zeroHour;
            minutes = Math.floor((angle % 30) * 2);
        }

        var dragging;

        $clock.on('mousedown', function() {
            dragging = false;
        });

        $clock.on('mouseup', function(e) {
            if (dragging) {
                return
            }
            
            var clickX = e.clientX;
            var clickY = e.clientY;
            var clockCoord = $clock.offset();
            var centerX = clockCoord.left + ($clock.outerWidth() / 2);
            var centerY = clockCoord.top + ($clock.outerHeight() / 2);
            var angle = Math.round(Math.atan2(centerX - clickX, centerY - clickY) * (180 / Math.PI));
            angle = (angle > 0) ? Math.abs(angle - 360) : Math.abs(angle);
            angle = roundAngle(angle);
            currentAngle = angle;
            $clockHand.css('transform', 'rotate(' + angle + 'deg)');
            angleToTime(angle);
            setDisplay();
            $input.val(hour + ':' + minutes + $ampmSelected.text());
        })

        // dependency: zingtouch.js

        var target = $clock[0];
        var region = new ZingTouch.Region(target);

        region.bind(target, 'rotate', function(e) {
            dragging = true;
            currentAngle += e.detail.distanceFromLast;
            currentAngle = roundAngle(currentAngle);
            $clockHand.css('transform', 'rotate(' + currentAngle + 'deg)');

            var trueAngle = currentAngle % 360;
            trueAngle = (trueAngle < 0) ? (360 + trueAngle) : trueAngle;
            angleToTime(trueAngle);
            setDisplay();
            $input.val(hour + ':' + minutes + $ampmSelected.text());
        });

    }
})();
