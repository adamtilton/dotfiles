#!/usr/bin/env ruby


class Cmus

  def initialize(cmus_remote_q)
    @status, @file, @duration, @position, @artist, @album, @title, @date, @genre,
      @trackum, @aaa_mode, @continue, @play_lib, @play_sorted, @replaygain,
      @replaygain_limit, @replaygain_preamp, @repeat, @repeat_current, @shuffle,
      @softvol, @vol_left, @vol_right = cmus_remote_q.split(/\n/)

    @status_symbols = {
      'status playing' => '>',
      'status paused'  => '=',
      'status stopped' => '.'
    }
  end

  def status_symbol
    @status_symbols[@status]
  end

  def play_stub
    [@artist,@album,@title].join(' .. ').gsub(/tag (artist|album|title)\s?/,'')
  end

  def now_playing
    @status == 'status stopped' ? self.status_symbol : [self.progress,self.status_symbol,self.play_stub].join(' ')
  end

  def progress
    position = @position.sub('position ','').to_f
    duration = @duration.sub('duration ','').to_i
    percentage = (position / duration).round(2)
    return sprintf("[%-50s] #{(percentage*100).to_i}%", "#" * (50.0 * percentage))
  end

end


def awesome_status
  cmus_remote_q = `cmus-remote -Q 2>&1`.strip!
  if cmus_remote_q == 'cmus-remote: cmus is not running'
    return 'not running' 
  else 
    cmus = Cmus.new(cmus_remote_q)
    return cmus.now_playing
  end

end

puts awesome_status
