<?php
/**
 * WordPress Integration Example (Conceptual)
 * 
 * This snippet demonstrates how you might wrap the Standalone SCPlayer
 * into a WordPress shortcode to make it easily deployable by editors.
 */

function sc_player_shortcode($atts) {
    $a = shortcode_atts( array(
        'playlist' => '2024',
    ), $atts );

    // 1. Enqueue required assets from your theme/plugin folder
    wp_enqueue_style('sc-player-css', get_template_directory_uri() . '/sc-player/sc-player.css');
    wp_enqueue_script('sc-widget-api', 'https://w.soundcloud.com/player/api.js', array(), null, true);
    wp_enqueue_script('sc-player-playlists', get_template_directory_uri() . '/sc-player/playlists.js', array(), null, true);
    wp_enqueue_script('sc-player-standalone', get_template_directory_uri() . '/sc-player/sc-player-standalone.js', array('sc-widget-api', 'sc-player-playlists'), null, true);

    // 2. Output the configuration object
    ob_start();
    ?>
    <script>
        window.PLAYER_CONFIG = {
            defaultPlaylist: '<?php echo esc_js($a['playlist']); ?>',
            playlists: window.PLAYER_PLAYLISTS,
            position: 'bottom',
            theme: {
                bg: '#1a1a1a',
                accent: '#ff5500'
            }
        };
    </script>
    <?php
    return ob_get_clean();
}

add_shortcode('sc_player', 'sc_player_shortcode');
